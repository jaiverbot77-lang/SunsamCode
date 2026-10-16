import { createHash, createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  copyTextWithExecCommand,
  hmacSha256,
  installSunsamClipboardFallback,
  resolveSunsamSameOriginRelayWsUrl,
  sha256,
  withSunsamFragmentParams,
} from "../src/sunsamInsecureContext.js";

const encoder = new TextEncoder();
const hex = (bytes: Uint8Array) => Buffer.from(bytes).toString("hex");

describe("Sunsam insecure-context crypto", () => {
  it("matches Node's SHA-256 for empty, short and multi-block inputs", () => {
    for (const input of ["", "abc", "x".repeat(55), "y".repeat(64), "z".repeat(1000)]) {
      expect(hex(sha256(encoder.encode(input)))).toBe(
        createHash("sha256").update(input).digest("hex"),
      );
    }
  });

  it("matches Node's HMAC-SHA256 with the relay proof format", () => {
    const passHash = "q1w2e3r4t5y6u7i8o9p0+/base64hash=";
    const message = "nonce123|terminal|deviceSid456";
    expect(hex(hmacSha256(encoder.encode(passHash), encoder.encode(message)))).toBe(
      createHmac("sha256", passHash).update(message).digest("hex"),
    );
    const longKey = "k".repeat(100);
    expect(hex(hmacSha256(encoder.encode(longKey), encoder.encode(message)))).toBe(
      createHmac("sha256", longKey).update(message).digest("hex"),
    );
  });

  it("uses the page's own server for the relay unless the page is on z.ai", () => {
    const fallback = "wss://zcode.z.ai/ws";
    expect(
      resolveSunsamSameOriginRelayWsUrl(
        {
          protocol: "http:",
          host: "192.168.1.20:47831",
          hostname: "192.168.1.20",
        },
        fallback,
      ),
    ).toBe("ws://192.168.1.20:47831/ws");
    expect(
      resolveSunsamSameOriginRelayWsUrl(
        {
          protocol: "https:",
          host: "pc.tail.ts.net",
          hostname: "pc.tail.ts.net",
        },
        fallback,
      ),
    ).toBe("wss://pc.tail.ts.net/ws");
    expect(
      resolveSunsamSameOriginRelayWsUrl(
        { protocol: "https:", host: "zcode.z.ai", hostname: "zcode.z.ai" },
        fallback,
      ),
    ).toBe(fallback);
  });

  it("reads the pairing secrets from the URL fragment, which never reaches the network", () => {
    const merged = withSunsamFragmentParams(
      new URLSearchParams("mid=m&app_version=3.15.1-sunsam.14"),
      "#sid=s1&hash=a%2Bb%3D&t=17",
    );
    expect(merged.get("sid")).toBe("s1");
    expect(merged.get("hash")).toBe("a+b=");
    expect(merged.get("app_version")).toBe("3.15.1-sunsam.14");
    // Enlaces antiguos con todo en la query siguen funcionando.
    expect(withSunsamFragmentParams(new URLSearchParams("sid=old&hash=h&t=1"), "").get("sid")).toBe(
      "old",
    );
  });

  it("copies text without the Clipboard API, as served over HTTP on the LAN", async () => {
    const copied: string[] = [];
    const appended: Array<{ value: string; remove: () => void }> = [];
    const doc = {
      createElement: () => {
        const el = {
          value: "",
          style: { cssText: "" },
          setAttribute: () => {},
          focus: () => {},
          select: () => {},
          setSelectionRange: () => {},
          remove: () => appended.splice(appended.indexOf(el), 1),
        };
        return el;
      },
      body: { appendChild: (el: { value: string; remove: () => void }) => appended.push(el) },
      getSelection: () => null,
      execCommand: (command: string) => {
        if (command !== "copy") return false;
        copied.push(appended.at(-1)?.value ?? "");
        return true;
      },
    } as unknown as Document;
    expect(copyTextWithExecCommand("| a | b |", doc)).toBe(true);
    expect(copied).toEqual(["| a | b |"]);
    expect(appended).toHaveLength(0);

    const nav = {} as Navigator;
    installSunsamClipboardFallback(nav);
    expect(typeof nav.clipboard.writeText).toBe("function");
    await expect(nav.clipboard.readText()).rejects.toThrow();

    const secure = { clipboard: { writeText: async () => {} } } as unknown as Navigator;
    const original = secure.clipboard;
    installSunsamClipboardFallback(secure);
    expect(secure.clipboard).toBe(original);
  });
});
