// @vitest-environment jsdom

import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ZCodeIntlProvider } from "@/i18n/IntlProvider.js";
import { ConversationDraftEmptyState } from "@/v4/ConversationDraftEmptyState.js";

afterEach(() => {
  cleanup();
});

describe("ConversationDraftEmptyState logo", () => {
  // Sunsam: la marca de agua es el contorno del logo Sunsam (rayos + triángulo) en ambos temas.
  it("shows the Sunsam outline watermark, faded towards the bottom", () => {
    const { container } = render(
      createElement(
        ZCodeIntlProvider,
        { initialLocale: "zh-CN" },
        createElement(ConversationDraftEmptyState),
      ),
    );

    const logo = container.querySelector("svg");
    const className = logo?.getAttribute("class") ?? "";

    expect(logo).not.toBeNull();
    expect(logo?.querySelectorAll("path")).toHaveLength(5);
    expect(logo?.querySelector("g")?.getAttribute("stroke")).toBe("currentColor");
    expect(className).toContain("opacity-70");
    expect(className).toContain("mask-image:linear-gradient");
    expect(container.querySelector('[data-v4-draft-logo="dark"]')).toBeNull();
  });
});
