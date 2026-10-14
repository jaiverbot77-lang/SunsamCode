/**
 * Sunsam: marketplaces de conectores MCP en el proceso principal.
 *
 * - La lista de marketplaces vive en `<userData>/marketplaces.json`; si no existe se usa el
 *   marketplace por defecto (jhonsu01/marketplace-SunsamCode).
 * - list: descarga cada marketplace.json y sus iconos (https, con límite de tamaño) y los cruza con
 *   las extensiones instaladas para marcar "Instalado" / "Actualizar".
 * - install: descarga el .mcpb del conector, verifica su SHA-256 y lo instala con el mismo
 *   instalador que el arrastrar y soltar (installSunsamMcpbPackage).
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app, ipcMain } from "electron";
import {
  SUNSAM_DEFAULT_MARKETPLACE,
  SUNSAM_MARKETPLACE_CHANNELS,
  compareSunsamVersions,
  parseSunsamMarketplace,
  resolveSunsamMarketplaceUrl,
  sunsamMarketplaceSourceKey,
  sunsamMcpbServerKey,
  type SunsamMarketplaceFile,
  type SunsamMarketplaceView,
  type SunsamMcpbInstallResult,
  type SunsamMcpbIpcResult,
} from "@zcode/shared";
import { installSunsamMcpbPackage, readSunsamInstalledVersions } from "./sunsamMcpbIpc.js";

const FETCH_TIMEOUT_MS = 20_000;
const MAX_MARKETPLACE_BYTES = 2 * 1024 * 1024;
const MAX_ICON_BYTES = 512 * 1024;
const MAX_PACKAGE_BYTES = 256 * 1024 * 1024;
const CATALOG_TTL_MS = 5 * 60 * 1000;

interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
}

interface CachedCatalog {
  fetchedAt: number;
  file: SunsamMarketplaceFile;
  icons: Map<string, string>;
}

const catalogCache = new Map<string, CachedCatalog>();

function configPath(): string {
  return join(app.getPath("userData"), "marketplaces.json");
}

async function readSources(): Promise<string[]> {
  if (!existsSync(configPath())) return [SUNSAM_DEFAULT_MARKETPLACE];
  try {
    const parsed = JSON.parse(await readFile(configPath(), "utf8")) as { sources?: unknown };
    return Array.isArray(parsed.sources)
      ? parsed.sources.filter((source): source is string => typeof source === "string")
      : [SUNSAM_DEFAULT_MARKETPLACE];
  } catch {
    return [SUNSAM_DEFAULT_MARKETPLACE];
  }
}

async function writeSources(sources: string[]): Promise<void> {
  await writeFile(configPath(), `${JSON.stringify({ sources }, null, 2)}\n`, "utf8");
}

async function fetchBytes(url: string, maxBytes: number): Promise<Buffer> {
  if (!url.startsWith("https://")) throw new Error(`only https downloads are allowed: ${url}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": `SunsamCode/${app.getVersion()}`, "cache-control": "no-cache" },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
    const declared = Number(response.headers.get("content-length") ?? 0);
    if (declared > maxBytes) throw new Error(`${url} is too large`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.byteLength > maxBytes) throw new Error(`${url} is too large`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function iconDataUrl(iconRef: string, baseUrl: string): Promise<string | undefined> {
  try {
    const url = new URL(iconRef, baseUrl).toString();
    const data = await fetchBytes(url, MAX_ICON_BYTES);
    const mime = /\.svg(\?|$)/iu.test(url)
      ? "image/svg+xml"
      : /\.jpe?g(\?|$)/iu.test(url)
        ? "image/jpeg"
        : "image/png";
    return `data:${mime};base64,${data.toString("base64")}`;
  } catch {
    return undefined;
  }
}

async function loadCatalog(source: string, refresh: boolean): Promise<CachedCatalog> {
  const url = resolveSunsamMarketplaceUrl(source);
  const cached = catalogCache.get(url);
  if (cached && !refresh && Date.now() - cached.fetchedAt < CATALOG_TTL_MS) return cached;
  const raw = await fetchBytes(url, MAX_MARKETPLACE_BYTES);
  const file = parseSunsamMarketplace(JSON.parse(raw.toString("utf8").replace(/^﻿/u, "")));
  const icons = new Map<string, string>();
  await Promise.all(
    file.connectors.map(async (connector) => {
      if (!connector.icon) return;
      const reused = cached?.icons.get(`${connector.name}@${connector.icon}`);
      const dataUrl = reused ?? (await iconDataUrl(connector.icon, url));
      if (dataUrl) icons.set(`${connector.name}@${connector.icon}`, dataUrl);
    }),
  );
  const next = { fetchedAt: Date.now(), file, icons };
  catalogCache.set(url, next);
  return next;
}

async function listViews(refresh: boolean, logger: Logger): Promise<SunsamMarketplaceView[]> {
  const [sources, installed] = await Promise.all([readSources(), readSunsamInstalledVersions()]);
  return Promise.all(
    sources.map(async (source): Promise<SunsamMarketplaceView> => {
      let url = source;
      try {
        url = resolveSunsamMarketplaceUrl(source);
        const { file, icons } = await loadCatalog(source, refresh);
        return {
          source,
          url,
          name: file.name,
          displayName: file.displayName ?? file.name,
          ...(file.updatedAt ? { updatedAt: file.updatedAt } : {}),
          connectors: file.connectors.map((connector) => {
            const serverKey = sunsamMcpbServerKey(connector.name);
            const installedVersion = installed[serverKey];
            const icon = connector.icon
              ? icons.get(`${connector.name}@${connector.icon}`)
              : undefined;
            const platforms = connector.platforms ?? [];
            return {
              name: connector.name,
              serverKey,
              displayName: connector.displayName,
              ...(connector.shortDescription
                ? { shortDescription: connector.shortDescription }
                : {}),
              ...(connector.category ? { category: connector.category } : {}),
              ...(connector.brandColor ? { brandColor: connector.brandColor } : {}),
              version: connector.version,
              ...(icon ? { iconDataUrl: icon } : {}),
              platforms,
              toolCount: connector.tools?.length ?? 0,
              ...(connector.repository ? { repository: connector.repository } : {}),
              ...(installedVersion ? { installedVersion } : {}),
              updateAvailable:
                installedVersion !== undefined &&
                compareSunsamVersions(connector.version, installedVersion) > 0,
              unsupportedPlatform: platforms.length > 0 && !platforms.includes(process.platform),
            };
          }),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`[sunsam-marketplace] ${source}: ${message}`);
        return { source, url, name: source, displayName: source, connectors: [], error: message };
      }
    }),
  );
}

async function addSource(source: string, logger: Logger): Promise<SunsamMarketplaceView[]> {
  const trimmed = source.trim();
  const key = sunsamMarketplaceSourceKey(trimmed); // valida el formato
  await loadCatalog(trimmed, true); // y que el marketplace existe y es válido
  const sources = await readSources();
  if (!sources.some((existing) => sunsamMarketplaceSourceKey(existing) === key)) {
    await writeSources([...sources, trimmed]);
    logger.info(`[sunsam-marketplace] added ${trimmed}`);
  }
  return listViews(false, logger);
}

async function removeSource(source: string, logger: Logger): Promise<SunsamMarketplaceView[]> {
  const key = sunsamMarketplaceSourceKey(source);
  const sources = await readSources();
  await writeSources(sources.filter((existing) => sunsamMarketplaceSourceKey(existing) !== key));
  logger.info(`[sunsam-marketplace] removed ${source}`);
  return listViews(false, logger);
}

async function installConnector(
  source: string,
  connectorName: string,
  logger: Logger,
): Promise<SunsamMcpbInstallResult> {
  const { file } = await loadCatalog(source, true);
  const connector = file.connectors.find((entry) => entry.name === connectorName);
  if (!connector) throw new Error(`${connectorName} is not in ${source}`);
  const data = await fetchBytes(connector.mcpb.url, MAX_PACKAGE_BYTES);
  if (connector.mcpb.sha256) {
    const actual = createHash("sha256").update(data).digest("hex");
    if (actual !== connector.mcpb.sha256.toLowerCase()) {
      throw new Error(
        `SHA-256 mismatch for ${connectorName}: the package was altered or the marketplace is stale`,
      );
    }
  }
  const fileName = decodeURIComponent(new URL(connector.mcpb.url).pathname.split("/").pop() ?? "");
  logger.info(
    `[sunsam-marketplace] installing ${connectorName}@${connector.version} from ${source}`,
  );
  return installSunsamMcpbPackage(
    {
      name: /\.(mcpb|dxt)$/iu.test(fileName) ? fileName : `${connectorName}.mcpb`,
      data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
    },
    logger,
  );
}

async function wrap<T>(run: () => Promise<T>, logger: Logger): Promise<SunsamMcpbIpcResult<T>> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`[sunsam-marketplace] ${message}`);
    return { ok: false, error: message };
  }
}

export function registerSunsamMarketplaceIpcHandlers(logger: Logger): void {
  ipcMain.handle(SUNSAM_MARKETPLACE_CHANNELS.list, (_event, refresh?: boolean) =>
    wrap(() => listViews(refresh === true, logger), logger),
  );
  ipcMain.handle(SUNSAM_MARKETPLACE_CHANNELS.add, (_event, source: string) =>
    wrap(() => addSource(String(source ?? ""), logger), logger),
  );
  ipcMain.handle(SUNSAM_MARKETPLACE_CHANNELS.remove, (_event, source: string) =>
    wrap(() => removeSource(String(source ?? ""), logger), logger),
  );
  ipcMain.handle(SUNSAM_MARKETPLACE_CHANNELS.install, (_event, source: string, name: string) =>
    wrap(() => installConnector(String(source), String(name), logger), logger),
  );
}
