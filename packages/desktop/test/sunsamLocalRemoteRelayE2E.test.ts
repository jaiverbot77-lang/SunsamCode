// Sunsam: el relay local tiene que entenderse con los transportes reales de upstream
// (escritorio y página móvil), no sólo con un cliente de prueba.
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket } from "ws";
import type { WebRemoteControlAppPayload } from "@zcode/shared";
import { createSunsamLocalRemoteServer } from "../src/main/sunsamLocalRemoteRelay.js";
import { WebRemoteControlDeviceTransport } from "../src/main/webRemoteControlTransport.js";
import { createNodeWebRemoteControlRelayAuthProvider } from "../src/main/webRemoteControlRelayAuthProvider.js";
import { WebRemoteControlTerminalTransport } from "../../web/src/webRemoteControlTransport.js";
import { calculateBrowserWebRemoteControlProof } from "../../web/src/webRemoteControlRelayAuthProvider.js";

const cleanups: Array<() => Promise<void> | void> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
});

function waitFor(check: () => boolean, label: string, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (check()) return resolve();
      if (Date.now() - started > timeoutMs) return reject(new Error(`timeout: ${label}`));
      setTimeout(tick, 20);
    };
    tick();
  });
}

const silent = { info: () => {}, warn: () => {}, error: () => {} };

describe("Sunsam local relay with the real upstream transports", () => {
  it("registers the desktop, pairs the phone and delivers payloads", async () => {
    const dir = await mkdtemp(join(tmpdir(), "sunsam-remote-e2e-"));
    await mkdir(join(dir, "web"), { recursive: true });
    await writeFile(join(dir, "web", "index.html"), "<!doctype html>");
    await writeFile(
      join(dir, "sunsam-remote-control.json"),
      JSON.stringify({
        port: 48010 + Math.floor(Math.random() * 40),
        host: "lan",
      }),
    );
    const server = createSunsamLocalRemoteServer({
      webRoot: join(dir, "web"),
      configDir: dir,
      logger: silent,
    });
    cleanups.push(async () => {
      await server.stop();
      await rm(dir, { recursive: true, force: true });
    });
    const { relayWsUrl } = await server.getEndpoints();

    const authProvider = createNodeWebRemoteControlRelayAuthProvider();
    const passHash = authProvider.createPassHash(authProvider.createPassword());
    let registered: { deviceSid: string; passHash: string } | undefined;
    const deviceStates: string[] = [];
    const desktopReceived: WebRemoteControlAppPayload[] = [];
    const device = new WebRemoteControlDeviceTransport({
      relayWsUrl,
      deviceMid: "test-mid",
      auth: { mode: "register", passHash },
      meta: { platform: "win32", version: "3.15.1-sunsam.14", name: "pc" },
      authProvider,
      logger: silent,
      onRegisteredAuth: (auth) => {
        registered = auth;
      },
      onStateChange: (state) => deviceStates.push(state),
      onPayload: (payload) => desktopReceived.push(payload),
      onError: () => {},
      onInvalidPersistedAuth: async () => {},
    });
    cleanups.push(() => device.dispose());
    device.start();
    await waitFor(() => deviceStates.includes("waiting_terminal"), "desktop waiting for phone");
    expect(registered?.passHash).toBe(passHash);

    const phoneStates: string[] = [];
    const phoneReceived: WebRemoteControlAppPayload[] = [];
    const phone = new WebRemoteControlTerminalTransport({
      relayWsUrl,
      deviceSid: registered!.deviceSid,
      passHash,
      deviceMid: "test-mid",
      WebSocketCtor: WebSocket as unknown as typeof globalThis.WebSocket,
      authProvider: { calculateProof: calculateBrowserWebRemoteControlProof },
      onPayload: (payload) => phoneReceived.push(payload),
      onStateChange: (state) => phoneStates.push(state),
      onFailure: () => {},
      onError: () => {},
      reloadPage: () => {},
    });
    cleanups.push(() => phone.dispose());
    phone.start();

    await waitFor(() => phoneStates.includes("paired"), "phone paired");
    await waitFor(() => deviceStates.includes("paired"), "desktop paired");

    const request = {
      zcode_type: "workspace-list-request",
      requestId: "r1",
    } as WebRemoteControlAppPayload;
    expect(phone.sendPayload(request)).toBe(true);
    await waitFor(() => desktopReceived.length > 0, "desktop received request");
    expect(desktopReceived[0]).toMatchObject({
      zcode_type: "workspace-list-request",
    });

    const reply = {
      zcode_type: "app-error",
      requestId: "r1",
      reason: "relay-unavailable",
      error: "test",
    } as WebRemoteControlAppPayload;
    expect(device.sendPayload(reply)).toBe(true);
    await waitFor(() => phoneReceived.length > 0, "phone received reply");
    expect(phoneReceived[0]).toMatchObject({
      zcode_type: "app-error",
      requestId: "r1",
    });
  });
});
