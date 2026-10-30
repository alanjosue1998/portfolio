import { describe, expect, it } from "vitest";

import { THEMES, themeCss, type Palette } from "./themes";

/** WCAG 2 relative luminance of a `#rrggbb` colour. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Every pairing the site actually draws, and the ratio it needs: 4.5:1 for
 * text, 3:1 for a control's outline (WCAG 1.4.11).
 */
const PAIRS: [keyof Palette, keyof Palette, number][] = [
  ["foreground", "background", 4.5],
  ["foreground", "surface", 4.5],
  ["muted", "background", 4.5],
  ["muted", "surface", 4.5],
  ["accent", "background", 4.5],
  ["accent", "surface", 4.5],
  // Skill chips, and the active item in the bottom bar.
  ["accentStrong", "accentSoft", 4.5],
  // The primary button, and its hover.
  ["onAccent", "accent", 4.5],
  ["onAccent", "accentStrong", 4.5],
  ["field", "background", 3],
  ["field", "surface", 3],
  ["danger", "background", 4.5],
  ["success", "background", 4.5],
];

describe("themes", () => {
  it.each(THEMES.map((theme) => [theme.name, theme] as const))(
    "%s clears WCAG AA everywhere it is used",
    (_name, theme) => {
      const failures = PAIRS.filter(
        ([text, ground, minimum]) => contrast(theme.palette[text], theme.palette[ground]) < minimum,
      ).map(
        ([text, ground, minimum]) =>
          `${text} on ${ground}: ${contrast(theme.palette[text], theme.palette[ground]).toFixed(2)} < ${minimum}`,
      );

      expect(failures).toEqual([]);
    },
  );

  it("gives every theme a unique id", () => {
    const ids = THEMES.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses six-digit hex colours, which the contrast check can read", () => {
    for (const theme of THEMES) {
      for (const value of Object.values(theme.palette)) expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("writes a rule per theme, and the print rule last", () => {
    const css = themeCss();

    for (const theme of THEMES) expect(css).toContain(`:root[data-theme="${theme.id}"]{`);
    expect(css.trim().split("\n").at(-1)).toMatch(/^@media print/);
    expect(css).toContain("--accent-strong:");
  });
});
