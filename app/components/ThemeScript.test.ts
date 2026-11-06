import { describe, expect, it } from "vitest";

import { themeScript } from "./ThemeScript";

/**
 * The script ships as a string, so neither TypeScript nor the linter ever sees
 * it as code; a syntax error in it only shows up as a site that ignores the
 * saved theme. This runs it against a stand-in document instead.
 */
function run(saved: string | null) {
  const head: { name: string; content: string; media: string }[] = [];
  const html = { dataset: {} as Record<string, string> };
  const document = {
    documentElement: html,
    head: { appendChild: (node: (typeof head)[number]) => head.push(node) },
    createElement: () => ({ name: "", content: "", media: "", setAttribute() {} }),
  };
  const localStorage = { getItem: () => saved };

  new Function("document", "localStorage", themeScript)(document, localStorage);

  return {
    theme: html.dataset.theme,
    tags: head.map(({ content, media }) => ({ content, media })),
  };
}

describe("themeScript", () => {
  it("applies a saved theme and gives the toolbar its background", () => {
    expect(run("cacao")).toEqual({ theme: "cacao", tags: [{ content: "#1c1310", media: "" }] });
  });

  it("leaves the system in charge when nothing is saved", () => {
    const { theme, tags } = run(null);

    expect(theme).toBeUndefined();
    expect(tags.map((tag) => tag.media)).toEqual([
      "(prefers-color-scheme: light)",
      "(prefers-color-scheme: dark)",
    ]);
  });

  it("ignores a value that is not a theme", () => {
    expect(run("nope").theme).toBeUndefined();
  });
});
