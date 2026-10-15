import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket } from "ws";
import {
  calculateSunsamRelayProof,
  createSunsamLocalRemoteServer,
  listSunsamRemoteAddresses,
  resolveSunsamRemoteHost,
} from "../src/main/sunsamLocalRemoteRelay.js";

type Message = Record<string, unknown>;

class Client {
  private readonly queue: Message[] = [];
  private waiters: Array<(message: Message) => void> = [];
  constructor(readonly socket: WebSocket) {
    socket.on("message", (raw) => {
      const message = JSON.parse(String(raw)) as Message;
      const waiter = this.waiters.shift();
      if (waiter) waiter(message);
      else this.queue.push(message);
    });
  }
  static async open(url: string): Promise<Client> {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.once("open", resolve);
      socket.once("error", reject);
    });
    return new Client(socket);
  }
  send(message: Message): void {
    this.socket.send(JSON.stringify(message));
  }
  next(): Promise<Message> {
    const queued = this.queue.shift();
    if (queued) return Promise.resolve(queued);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 3000);
      this.waiters.push((message) => {
        clearTimeout(timer);
        resolve(message);
      });
    });
  }
  async authenticate(role: "device" | "terminal", deviceSid: string, passHash: string) {
    this.send({ type: "auth_init", role, device_sid: deviceSid, meta: {} });
    const challenge = await this.next();
    expect(challenge.type).toBe("auth_challenge");
    this.send({
      type: "auth_response",
      device_sid: deviceSid,
      proof: calculateSunsamRelayProof(passHash, String(challenge.nonce), role, deviceSid),
    });
    return this.next();
  }
  close(): void {
    this.socket.close();
  }
}

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
});

async function startServer(config?: Record<string, unknown>) {
  const dir = await mkdtemp(join(tmpdir(), "sunsam-remote-"));
  const webRoot = join(dir, "web");
  await mkdir(join(webRoot, "assets"), { recursive: true });
  await writeFile(join(webRoot, "index.html"), "<!doctype html><title>remote</title>");
  await writeFile(join(webRoot, "assets", "app.js"), "console.log(1)");
  const configDir = join(dir, "config");
  await mkdir(configDir, { recursive: true });
  await writeFile(
    join(configDir, "sunsam-remote-control.json"),
    JSON.stringify({
      port: 47950 + Math.floor(Math.random() * 40),
      host: "lan",
      ...config,
    }),
  );
  const server = createSunsamLocalRemoteServer({
    webRoot,
    configDir,
    logger: { info: () => {}, warn: () => {} },
  });
  cleanups.push(async () => {
    await server.stop();
    await rm(dir, { recursive: true, force: true });
  });
  const endpoints = await server.getEndpoints();
  const port = new URL(endpoints.relayWsUrl).port;
  return { server, endpoints, port, configDir };
}

describe("Sunsam local remote relay", () => {
  it("pairs desktop and phone and forwards data both ways", async () => {
    const { endpoints } = await startServer();
    const desktop = await Client.open(endpoints.relayWsUrl);
    cleanups.push(async () => desktop.close());
    desktop.send({
      type: "device_register_init",
      device_mid: "m",
      pass_hash: "h4sh",
      meta: {},
    });
    const registered = await desktop.next();
    expect(registered.type).toBe("device_register_ack");
    const sid = String(registered.device_sid);

    const desktopAck = await desktop.authenticate("device", sid, "h4sh");
    expect(desktopAck).toMatchObject({
      type: "auth_ack",
      pair_status: "waiting",
    });

    const phone = await Client.open(endpoints.relayWsUrl);
    cleanups.push(async () => phone.close());
    const phoneAck = await phone.authenticate("terminal", sid, "h4sh");
    expect(phoneAck).toMatchObject({
      type: "auth_ack",
      pair_status: "matched",
    });
    // El escritorio se entera sin esperar a su consulta periódica.
    expect(await desktop.next()).toMatchObject({
      type: "pair_status_ack",
      pair_status: "matched",
    });

    phone.send({
      type: "data",
      payload: { zcode_type: "bootstrap-request", requestId: "1" },
    });
    expect(await desktop.next()).toMatchObject({
      type: "data",
      payload: { zcode_type: "bootstrap-request", requestId: "1" },
    });
    desktop.send({
      type: "data",
      payload: { zcode_type: "bootstrap-response", requestId: "1" },
    });
    expect(await phone.next()).toMatchObject({ type: "data" });

    desktop.send({ type: "pair_status_query", device_sid: sid });
    expect(await desktop.next()).toMatchObject({
      type: "pair_status_ack",
      pair_status: "matched",
    });

    phone.close();
    expect(await desktop.next()).toMatchObject({
      type: "pair_status_ack",
      pair_status: "waiting",
    });
  });

  it("rejects a phone with the wrong password hash", async () => {
    const { endpoints } = await startServer();
    const desktop = await Client.open(endpoints.relayWsUrl);
    cleanups.push(async () => desktop.close());
    desktop.send({
      type: "device_register_init",
      device_mid: "m",
      pass_hash: "right",
      meta: {},
    });
    const sid = String((await desktop.next()).device_sid);
    await desktop.authenticate("device", sid, "right");

    const phone = await Client.open(endpoints.relayWsUrl);
    cleanups.push(async () => phone.close());
    expect(await phone.authenticate("terminal", sid, "wrong")).toMatchObject({
      type: "error",
      code: "AUTH_FAILED",
    });
  });

  it("reports DEVICE_OFFLINE to a phone before the desktop connects and AUTH_FAILED for unknown links", async () => {
    const { endpoints, configDir } = await startServer();
    const desktop = await Client.open(endpoints.relayWsUrl);
    desktop.send({
      type: "device_register_init",
      device_mid: "m",
      pass_hash: "h",
      meta: {},
    });
    const sid = String((await desktop.next()).device_sid);
    desktop.close();

    const phone = await Client.open(endpoints.relayWsUrl);
    cleanups.push(async () => phone.close());
    phone.send({
      type: "auth_init",
      role: "terminal",
      device_sid: sid,
      meta: {},
    });
    expect(await phone.next()).toMatchObject({
      type: "error",
      code: "DEVICE_OFFLINE",
    });
    phone.send({
      type: "auth_init",
      role: "terminal",
      device_sid: "nope",
      meta: {},
    });
    expect(await phone.next()).toMatchObject({
      type: "error",
      code: "AUTH_FAILED",
    });

    // El enlace sobrevive a reiniciar la app: la sesión se guarda en disco.
    await new Promise((resolve) => setTimeout(resolve, 50));
    const saved = JSON.parse(
      await readFile(join(configDir, "sunsam-remote-sessions.json"), "utf8"),
    ) as Record<string, string>;
    expect(saved[sid]).toBe("h");
  });

  it("serves the mobile page and its assets, and nothing outside it", async () => {
    const { endpoints, port } = await startServer();
    expect(endpoints.remoteUrl).toMatch(new RegExp(`^http://.+:${port}/remote/v4$`));
    const base = `http://127.0.0.1:${port}`;
    const page = await fetch(`${base}/remote/v4?sid=x&hash=y&t=1`);
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("<title>remote</title>");
    const asset = await fetch(`${base}/remote/v4/assets/app.js`);
    expect(asset.headers.get("content-type")).toContain("javascript");
    expect((await fetch(`${base}/remote/v4/../../config/x`)).status).not.toBe(200);
    expect((await fetch(`${base}/api/anything`)).status).toBe(404);
  });
});

describe("Sunsam remote host selection", () => {
  const interfaces = {
    "vEthernet (WSL)": [{ family: "IPv4", internal: false, address: "172.20.0.1" }],
    "Wi-Fi": [{ family: "IPv4", internal: false, address: "192.168.1.20" }],
    Tailscale: [{ family: "IPv4", internal: false, address: "100.101.102.103" }],
    Loopback: [{ family: "IPv4", internal: true, address: "127.0.0.1" }],
  } as unknown as Parameters<typeof listSunsamRemoteAddresses>[0];

  it("puts the default-route address first, ahead of VirtualBox's 192.168.56.x", () => {
    const pc = {
      Ethernet: [{ family: "IPv4", internal: false, address: "192.168.1.8" }],
      "Ethernet 2": [{ family: "IPv4", internal: false, address: "192.168.56.1" }],
    } as unknown as Parameters<typeof listSunsamRemoteAddresses>[0];
    expect(listSunsamRemoteAddresses(pc).lan).toEqual(["192.168.1.8", "192.168.56.1"]);
    expect(listSunsamRemoteAddresses(pc, "192.168.56.1").lan[0]).toBe("192.168.56.1");
  });

  it("puts Wi-Fi before virtual adapters and recognises Tailscale", () => {
    expect(listSunsamRemoteAddresses(interfaces)).toEqual({
      lan: ["192.168.1.20", "172.20.0.1"],
      tailscale: ["100.101.102.103"],
    });
  });

  it("uses Tailscale in auto mode when present, the LAN otherwise, or a fixed host", () => {
    const addresses = listSunsamRemoteAddresses(interfaces);
    expect(resolveSunsamRemoteHost({}, addresses)).toBe("100.101.102.103");
    expect(resolveSunsamRemoteHost({ host: "lan" }, addresses)).toBe("192.168.1.20");
    expect(resolveSunsamRemoteHost({}, { lan: ["192.168.1.20"], tailscale: [] })).toBe(
      "192.168.1.20",
    );
    expect(resolveSunsamRemoteHost({ host: "pc.tail1234.ts.net" }, addresses)).toBe(
      "pc.tail1234.ts.net",
    );
  });
});
