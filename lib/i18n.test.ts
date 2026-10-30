import { describe, expect, it } from "vitest";

import { defaultLocale, matchLocale } from "./i18n";

describe("matchLocale", () => {
  it("falls back to the default with no header", () => {
    expect(matchLocale(null)).toBe(defaultLocale);
    expect(matchLocale("")).toBe(defaultLocale);
  });

  it("picks a supported language", () => {
    expect(matchLocale("en")).toBe("en");
    expect(matchLocale("es")).toBe("es");
  });

  it("ignores region subtags", () => {
    expect(matchLocale("en-GB")).toBe("en");
    expect(matchLocale("es-EC,es;q=0.9")).toBe("es");
  });

  it("is case-insensitive", () => {
    expect(matchLocale("EN-us")).toBe("en");
  });

  it("orders by quality value, not by position", () => {
    expect(matchLocale("es;q=0.5,en;q=0.9")).toBe("en");
    expect(matchLocale("en;q=0.4, es")).toBe("es");
  });

  it("skips unsupported languages for the first supported one", () => {
    expect(matchLocale("fr-FR,fr;q=0.9,en;q=0.8,es;q=0.7")).toBe("en");
  });

  it("falls back to the default when nothing is supported", () => {
    expect(matchLocale("fr-FR,de;q=0.8")).toBe(defaultLocale);
  });
});
