import { describe, expect, it } from "vitest";
import { normalizeBotMessageLocale } from "../src/bots/messages.js";

// Sunsam: los idiomas añadidos (es-ES, pt-BR, fr-FR, ru-RU, ko-KR) no tienen textos de bot propios;
// antes caían al chino y Telegram mezclaba respuestas en chino con el idioma del usuario.
describe("bot message locale (Sunsam)", () => {
  it("uses English for the Sunsam locales and keeps Chinese only for zh-CN", () => {
    for (const locale of ["es-ES", "pt-BR", "fr-FR", "ru-RU", "ko-KR", "en-US"] as const) {
      expect(normalizeBotMessageLocale(locale)).toBe("en-US");
    }
    expect(normalizeBotMessageLocale("zh-CN")).toBe("zh-CN");
  });
});
