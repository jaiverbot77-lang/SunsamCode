/**
 * Sunsam: relay WebSocket local con el protocolo de zcode-remote-hub (el relay de Z.ai), para
 * emparejar el teléfono con la app sin servidores externos. Lo sirve sunsamLocalRemoteRelay.ts.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { WebSocket, type RawData } from "ws";

interface RelaySession {
  passHash: string;
  device?: WebSocket;
  terminal?: WebSocket;
  terminalSid?: string;
}

interface SocketState {
  role?: "device" | "terminal";
  deviceSid?: string;
  nonce?: string;
  authenticated: boolean;
}

export function calculateSunsamRelayProof(
  passHash: string,
  nonce: string,
  role: "device" | "terminal",
  deviceSid: string,
): string {
  return createHmac("sha256", passHash).update(`${nonce}|${role}|${deviceSid}`).digest("base64url");
}

function proofMatches(expected: string, received: unknown): boolean {
  if (typeof received !== "string") return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

function rawToText(raw: RawData): string {
  if (Array.isArray(raw)) return Buffer.concat(raw).toString("utf8");
  if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString("utf8");
  return Buffer.from(raw).toString("utf8");
}

function send(socket: WebSocket | undefined, message: Record<string, unknown>): void {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ ...message, server_ts: Date.now() }));
  }
}

function isOpen(socket: WebSocket | undefined): socket is WebSocket {
  return socket?.readyState === WebSocket.OPEN;
}

/**
 * Relay en memoria con el protocolo de zcode-remote-hub. Las sesiones (sid + hash) se guardan en
 * disco para que el enlace del teléfono siga valiendo tras reiniciar la app.
 */
export class SunsamLocalRelay {
  private readonly sessions = new Map<string, RelaySession>();
  private readonly states = new WeakMap<WebSocket, SocketState>();

  constructor(
    private readonly persist: (sessions: Record<string, string>) => void = () => {},
    initial: Record<string, string> = {},
  ) {
    for (const [sid, passHash] of Object.entries(initial)) {
      if (typeof passHash === "string" && passHash) this.sessions.set(sid, { passHash });
    }
  }

  attach(socket: WebSocket): void {
    this.states.set(socket, { authenticated: false });
    socket.on("message", (raw) => this.handle(socket, raw));
    socket.on("close", () => this.detach(socket));
    socket.on("error", () => this.detach(socket));
  }

  private handle(socket: WebSocket, raw: RawData): void {
    const state = this.states.get(socket);
    if (!state) return;
    const text = rawToText(raw);
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(text) as Record<string, unknown>;
    } catch {
      send(socket, {
        type: "error",
        code: "WRONG_PARAM",
        message: "invalid json",
      });
      return;
    }
    switch (message.type) {
      case "device_register_init":
        this.register(socket, message);
        return;
      case "auth_init":
        this.authInit(socket, state, message);
        return;
      case "auth_response":
        this.authResponse(socket, state, message);
        return;
      case "pair_status_query":
        if (!state.authenticated || !state.deviceSid) {
          send(socket, {
            type: "error",
            code: "AUTH_FAILED",
            message: "not authenticated",
          });
          return;
        }
        this.sendPairStatus(socket, state.deviceSid);
        return;
      case "data":
        this.forward(socket, state, text);
        return;
      default:
        send(socket, {
          type: "error",
          code: "WRONG_PARAM",
          message: "unknown message type",
        });
    }
  }

  private register(socket: WebSocket, message: Record<string, unknown>): void {
    const passHash = typeof message.pass_hash === "string" ? message.pass_hash : "";
    if (!passHash) {
      send(socket, {
        type: "error",
        code: "WRONG_PARAM",
        message: "pass_hash required",
      });
      return;
    }
    const deviceSid = randomBytes(18).toString("base64url");
    this.sessions.set(deviceSid, { passHash });
    this.save();
    send(socket, { type: "device_register_ack", device_sid: deviceSid });
  }

  private authInit(socket: WebSocket, state: SocketState, message: Record<string, unknown>): void {
    const role = message.role === "device" || message.role === "terminal" ? message.role : null;
    const deviceSid = typeof message.device_sid === "string" ? message.device_sid : "";
    if (!role || !deviceSid) {
      send(socket, {
        type: "error",
        code: "WRONG_PARAM",
        message: "role and device_sid required",
      });
      return;
    }
    const session = this.sessions.get(deviceSid);
    if (!session) {
      send(socket, {
        type: "error",
        code: "AUTH_FAILED",
        message: "unknown device",
      });
      return;
    }
    if (role === "terminal" && !isOpen(session.device)) {
      // El equipo aún no se conectó (o se cerró la app): el móvil reintenta solo.
      send(socket, {
        type: "error",
        code: "DEVICE_OFFLINE",
        message: "desktop offline",
      });
      return;
    }
    state.role = role;
    state.deviceSid = deviceSid;
    state.authenticated = false;
    state.nonce = randomBytes(24).toString("base64url");
    send(socket, { type: "auth_challenge", nonce: state.nonce });
  }

  private authResponse(
    socket: WebSocket,
    state: SocketState,
    message: Record<string, unknown>,
  ): void {
    const session = state.deviceSid ? this.sessions.get(state.deviceSid) : undefined;
    if (!session || !state.role || !state.nonce || !state.deviceSid) {
      send(socket, {
        type: "error",
        code: "WRONG_PARAM",
        message: "auth_init required",
      });
      return;
    }
    const expected = calculateSunsamRelayProof(
      session.passHash,
      state.nonce,
      state.role,
      state.deviceSid,
    );
    state.nonce = undefined;
    if (!proofMatches(expected, message.proof)) {
      send(socket, {
        type: "error",
        code: "AUTH_FAILED",
        message: "invalid proof",
      });
      socket.close();
      return;
    }
    state.authenticated = true;
    if (state.role === "device") {
      if (session.device && session.device !== socket) session.device.close();
      session.device = socket;
    } else {
      if (session.terminal && session.terminal !== socket && isOpen(session.terminal)) {
        // Un enlace, un teléfono: la página nueva sustituye a la anterior.
        send(session.terminal, {
          type: "error",
          code: "KICKED",
          message: "replaced",
        });
        session.terminal.close();
      }
      session.terminal = socket;
      session.terminalSid = randomBytes(12).toString("base64url");
    }
    send(socket, {
      type: "auth_ack",
      device_sid: state.deviceSid,
      ...(session.terminalSid ? { terminal_sid: session.terminalSid } : {}),
      pair_status: this.pairStatus(session),
    });
    this.notifyPeer(session, socket);
  }

  private forward(socket: WebSocket, state: SocketState, text: string): void {
    const session = state.deviceSid ? this.sessions.get(state.deviceSid) : undefined;
    if (!state.authenticated || !session) {
      send(socket, {
        type: "error",
        code: "AUTH_FAILED",
        message: "not authenticated",
      });
      return;
    }
    const peer = state.role === "device" ? session.terminal : session.device;
    if (!isOpen(peer)) {
      // Igual que zcode-remote-hub: sin par, INTERNAL y la conexión sigue abierta.
      send(socket, {
        type: "error",
        code: "INTERNAL",
        message: "peer not connected",
      });
      return;
    }
    peer.send(text);
  }

  private detach(socket: WebSocket): void {
    const state = this.states.get(socket);
    if (!state?.deviceSid) return;
    const session = this.sessions.get(state.deviceSid);
    if (!session) return;
    if (session.device === socket) session.device = undefined;
    if (session.terminal === socket) {
      session.terminal = undefined;
      session.terminalSid = undefined;
    }
    const remaining = session.device ?? session.terminal;
    if (remaining) this.sendPairStatus(remaining, state.deviceSid);
  }

  private pairStatus(session: RelaySession): "waiting" | "matched" {
    return isOpen(session.device) && isOpen(session.terminal) ? "matched" : "waiting";
  }

  private sendPairStatus(socket: WebSocket, deviceSid: string): void {
    const session = this.sessions.get(deviceSid);
    if (!session) {
      send(socket, {
        type: "error",
        code: "AUTH_FAILED",
        message: "unknown device",
      });
      return;
    }
    send(socket, {
      type: "pair_status_ack",
      ...(session.terminalSid ? { terminal_sid: session.terminalSid } : {}),
      pair_status: this.pairStatus(session),
    });
  }

  private notifyPeer(session: RelaySession, socket: WebSocket): void {
    const peer = session.device === socket ? session.terminal : session.device;
    const deviceSid = this.states.get(socket)?.deviceSid;
    if (isOpen(peer) && deviceSid) this.sendPairStatus(peer, deviceSid);
  }

  private save(): void {
    const snapshot: Record<string, string> = {};
    for (const [sid, session] of this.sessions) snapshot[sid] = session.passHash;
    this.persist(snapshot);
  }
}
