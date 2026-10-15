/**
 * Sunsam: control remoto desde el móvil sin pasar por servidores externos.
 *
 * Upstream empareja el teléfono a través de `wss://zcode.z.ai/ws` y sirve la página móvil desde
 * `https://zcode.z.ai/remote/v4`, que sólo existe para las versiones oficiales de ZCode (con una
 * versión Sunsam responde "Not found"). Este módulo hace ambas cosas dentro de la app:
 *
 * - Un servidor HTTP en la red local que sirve la página móvil (`packages/web`, compilada en
 *   `out/remote-web` con base `/remote/v4/`).
 * - Un relay WebSocket en `/ws` con el mismo protocolo que el de Z.ai (registro del equipo,
 *   reto HMAC con el hash de la contraseña del QR, estado de emparejamiento y reenvío de `data`).
 *
 * El teléfono debe estar en la misma red (Wi-Fi) que el equipo. Para usarlo fuera de casa basta
 * con Tailscale (o WireGuard) en ambos: la dirección del QR pasa a ser la de la VPN.
 */
import { createSocket } from "node:dgram";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { networkInterfaces } from "node:os";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { WebSocketServer } from "ws";
import { SunsamLocalRelay } from "./sunsamLocalRelayProtocol.js";

export { calculateSunsamRelayProof } from "./sunsamLocalRelayProtocol.js";

export const SUNSAM_REMOTE_DEFAULT_PORT = 47831;
const REMOTE_ROUTE = "/remote/v4";
const RELAY_PATH = "/ws";
/** Holgura sobre el límite de frame del protocolo (4 MiB) para el sobre JSON del relay. */
const MAX_RELAY_FRAME_BYTES = 8 * 1024 * 1024;
const PORT_ATTEMPTS = 10;

export type SunsamRemoteHostMode = "auto" | "lan" | "tailscale";

export interface SunsamRemoteControlConfig {
  /** "auto" (Tailscale si está activo, si no la red local), "lan", "tailscale" o un host fijo. */
  host?: SunsamRemoteHostMode | string;
  port?: number;
}

interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".bcmap": "application/octet-stream",
  ".map": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

/** 100.64.0.0/10: rango CGNAT que usa Tailscale para las direcciones de sus nodos. */
export function isTailscaleIpv4(address: string): boolean {
  const [a, b] = address.split(".").map(Number);
  return a === 100 && b !== undefined && b >= 64 && b <= 127;
}

function isPrivateLanIpv4(address: string): boolean {
  const [a, b] = address.split(".").map(Number);
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  return a === 172 && b !== undefined && b >= 16 && b <= 31;
}

export interface SunsamRemoteAddresses {
  lan: string[];
  tailscale: string[];
}

/**
 * IP local que el sistema usa para salir a Internet (la de la Wi-Fi o el cable, no la de VirtualBox
 * o WSL). Un socket UDP "conectado" sólo resuelve la ruta: no envía ningún paquete.
 */
export function detectDefaultRouteIpv4(timeoutMs = 1000): Promise<string | undefined> {
  return new Promise((resolveRoute) => {
    const socket = createSocket("udp4");
    const finish = (address?: string) => {
      clearTimeout(timer);
      try {
        socket.close();
      } catch {
        // ya cerrado
      }
      resolveRoute(address);
    };
    const timer = setTimeout(() => finish(), timeoutMs);
    socket.once("error", () => finish());
    try {
      socket.connect(53, "1.1.1.1", () => {
        try {
          finish(socket.address().address);
        } catch {
          finish();
        }
      });
    } catch {
      finish();
    }
  });
}

/** Adaptadores virtuales (WSL, Hyper-V, Docker, VMware, VirtualBox): el teléfono no los alcanza. */
function isVirtualAdapter(name: string, address: string): boolean {
  // 192.168.56.x es la red "host-only" por defecto de VirtualBox, aunque se llame "Ethernet 2".
  return (
    /vEthernet|docker|br-|virtual|vmnet|vbox|wsl|hyper-v/i.test(name) ||
    address.startsWith("192.168.56.")
  );
}

export function listSunsamRemoteAddresses(
  interfaces: ReturnType<typeof networkInterfaces> = networkInterfaces(),
  defaultRouteIp?: string,
): SunsamRemoteAddresses {
  const real: string[] = [];
  const virtual: string[] = [];
  const tailscale: string[] = [];
  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family !== "IPv4" || entry.internal) continue;
      if (isTailscaleIpv4(entry.address) || /tailscale/i.test(name)) {
        tailscale.push(entry.address);
      } else if (isPrivateLanIpv4(entry.address)) {
        (isVirtualAdapter(name, entry.address) ? virtual : real).push(entry.address);
      }
    }
  }
  const lan = [...real, ...virtual];
  // La IP de la ruta por defecto es la de la Wi-Fi o el cable: siempre la primera.
  if (defaultRouteIp && lan.includes(defaultRouteIp)) {
    lan.splice(lan.indexOf(defaultRouteIp), 1);
    lan.unshift(defaultRouteIp);
  }
  return { lan, tailscale };
}

/** Host que va en el QR según la configuración del usuario. */
export function resolveSunsamRemoteHost(
  config: SunsamRemoteControlConfig,
  addresses: SunsamRemoteAddresses,
): string {
  const mode = config.host?.trim() || "auto";
  if (mode === "lan") return addresses.lan[0] ?? addresses.tailscale[0] ?? "127.0.0.1";
  if (mode === "tailscale") return addresses.tailscale[0] ?? addresses.lan[0] ?? "127.0.0.1";
  if (mode === "auto") return addresses.tailscale[0] ?? addresses.lan[0] ?? "127.0.0.1";
  return mode;
}

async function serveStatic(
  webRoot: string,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const url = new URL(request.url ?? "/", "http://local");
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === "/" || pathname === "/remote" || pathname === "/remote/") {
    response.writeHead(302, { Location: `${REMOTE_ROUTE}${url.search}` });
    response.end();
    return;
  }
  if (pathname === "/favicon.ico") {
    return sendFile(join(webRoot, "favicon.ico"), response, "public, max-age=86400");
  }
  if (pathname !== REMOTE_ROUTE && !pathname.startsWith(`${REMOTE_ROUTE}/`)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const relative = pathname.slice(REMOTE_ROUTE.length).replace(/^\/+/, "");
  const target = normalize(join(webRoot, relative));
  if (target !== webRoot && !target.startsWith(webRoot + sep)) {
    response.writeHead(403);
    response.end();
    return;
  }
  const info = relative ? await stat(target).catch(() => null) : null;
  if (info?.isFile()) {
    const immutable = relative.startsWith("assets/");
    return sendFile(
      target,
      response,
      immutable ? "public, max-age=31536000, immutable" : "no-cache",
    );
  }
  // Rutas de la SPA (y /remote/v4 con sus parámetros): siempre index.html.
  return sendFile(join(webRoot, "index.html"), response, "no-cache");
}

async function sendFile(
  path: string,
  response: ServerResponse,
  cacheControl: string,
): Promise<void> {
  const info = await stat(path).catch(() => null);
  if (!info?.isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  createReadStream(path).pipe(response);
}

export interface SunsamLocalRemoteServerOptions {
  /** Carpeta con la página móvil compilada (index.html + assets). */
  webRoot: string;
  /** Carpeta de configuración (~/.zcode/v2): `sunsam-remote-control.json` y las sesiones. */
  configDir: string;
  logger: Logger;
}

export interface SunsamLocalRemoteEndpoints {
  relayWsUrl: string;
  remoteUrl: string;
}

export function createSunsamLocalRemoteServer(options: SunsamLocalRemoteServerOptions) {
  const configPath = join(options.configDir, "sunsam-remote-control.json");
  const sessionsPath = join(options.configDir, "sunsam-remote-sessions.json");
  let starting: Promise<{ server: Server; port: number }> | undefined;

  async function readJson<T>(path: string, fallback: T): Promise<T> {
    try {
      return JSON.parse(await readFile(path, "utf8")) as T;
    } catch {
      return fallback;
    }
  }

  async function readConfig(): Promise<SunsamRemoteControlConfig> {
    const config = await readJson<SunsamRemoteControlConfig>(configPath, {});
    return config && typeof config === "object" ? config : {};
  }

  async function listen(server: Server, firstPort: number): Promise<number> {
    for (let port = firstPort; port < firstPort + PORT_ATTEMPTS; port += 1) {
      const ok = await new Promise<boolean>((resolveListen) => {
        const onError = (error: NodeJS.ErrnoException) => {
          server.off("listening", onListening);
          if (error.code === "EADDRINUSE" || error.code === "EACCES") resolveListen(false);
          else resolveListen(false);
        };
        const onListening = () => {
          server.off("error", onError);
          resolveListen(true);
        };
        server.once("error", onError);
        server.once("listening", onListening);
        server.listen(port, "0.0.0.0");
      });
      if (ok) return port;
    }
    throw new Error(
      `No free port for Sunsam remote control (${firstPort}-${firstPort + PORT_ATTEMPTS - 1})`,
    );
  }

  async function start(): Promise<{ server: Server; port: number }> {
    const config = await readConfig();
    const sessions = await readJson<Record<string, string>>(sessionsPath, {});
    const relay = new SunsamLocalRelay((snapshot) => {
      void mkdir(dirname(sessionsPath), { recursive: true })
        .then(() => writeFile(sessionsPath, JSON.stringify(snapshot), "utf8"))
        .catch((error: unknown) =>
          options.logger.warn("[sunsam-remote] could not save sessions", {
            error: String(error),
          }),
        );
    }, sessions);
    const webRoot = resolve(options.webRoot);
    const server = createServer((request, response) => {
      void serveStatic(webRoot, request, response).catch((error: unknown) => {
        options.logger.warn("[sunsam-remote] static error", {
          error: String(error),
        });
        if (!response.headersSent) response.writeHead(500);
        response.end();
      });
    });
    const wss = new WebSocketServer({
      noServer: true,
      maxPayload: MAX_RELAY_FRAME_BYTES,
    });
    server.on("upgrade", (request, socket, head) => {
      const pathname = new URL(request.url ?? "/", "http://local").pathname;
      if (pathname !== RELAY_PATH) {
        socket.destroy();
        return;
      }
      wss.handleUpgrade(request, socket, head, (ws) => relay.attach(ws));
    });
    const preferredPort =
      Number.isInteger(config.port) && (config.port ?? 0) > 0 && (config.port ?? 0) < 65536
        ? (config.port as number)
        : SUNSAM_REMOTE_DEFAULT_PORT;
    const port = await listen(server, preferredPort);
    options.logger.info(`[sunsam-remote] local remote control listening on 0.0.0.0:${port}`);
    return { server, port };
  }

  return {
    /** Arranca el servidor la primera vez y devuelve las URL para el relay y el QR. */
    async getEndpoints(): Promise<SunsamLocalRemoteEndpoints> {
      starting ??= start().catch((error: unknown) => {
        starting = undefined;
        throw error;
      });
      const { port } = await starting;
      const addresses = listSunsamRemoteAddresses(
        networkInterfaces(),
        await detectDefaultRouteIpv4(),
      );
      const host = resolveSunsamRemoteHost(await readConfig(), addresses);
      const hostPart = host.includes(":") && !host.startsWith("[") ? `[${host}]` : host;
      return {
        relayWsUrl: `ws://127.0.0.1:${port}${RELAY_PATH}`,
        remoteUrl: `http://${hostPart}:${port}${REMOTE_ROUTE}`,
      };
    },
    async stop(): Promise<void> {
      const current = await starting?.catch(() => undefined);
      starting = undefined;
      await new Promise<void>((resolveClose) => {
        if (!current) return resolveClose();
        current.server.close(() => resolveClose());
        current.server.closeAllConnections?.();
      });
    },
  };
}
