import { describe, expect, it } from "vitest";

import adminEn from "./admin/en.json";
import adminEs from "./admin/es.json";
import en from "./en.json";
import es from "./es.json";

/**
 * Both dictionary types are derived from the Spanish file, so a key missing
 * from the English one is already a compile error. An extra key, or a value
 * left blank, is not — and that is what this catches.
 *
 * Returns one line per problem, with the dotted path to it, so a failure says
 * exactly where to look.
 */
function compare(reference: unknown, other: unknown, path = ""): string[] {
  if (typeof reference === "string") {
    if (typeof other !== "string") return [`${path}: expected a string`];
    return other.trim() ? [] : [`${path}: empty`];
  }

  if (Array.isArray(reference)) {
    if (!Array.isArray(other)) return [`${path}: expected an array`];
    if (other.length !== reference.length) {
      return [`${path}: ${other.length} items, expected ${reference.length}`];
    }
    return reference.flatMap((item, index) => compare(item, other[index], `${path}[${index}]`));
  }

  if (reference && typeof reference === "object") {
    if (!other || typeof other !== "object" || Array.isArray(other)) {
      return [`${path}: expected an object`];
    }

    const keys = new Set([...Object.keys(reference), ...Object.keys(other)]);

    return [...keys].flatMap((key) => {
      const child = path ? `${path}.${key}` : key;
      if (!(key in reference)) return [`${child}: extra key`];
      if (!(key in other)) return [`${child}: missing`];
      return compare(
        (reference as Record<string, unknown>)[key],
        (other as Record<string, unknown>)[key],
        child,
      );
    });
  }

  return typeof other === typeof reference ? [] : [`${path}: expected a ${typeof reference}`];
}

describe("dictionary parity", () => {
  it.each([
    ["public site", es, en],
    ["admin panel", adminEs, adminEn],
  ])("%s: English matches Spanish key for key", (_name, spanish, english) => {
    expect(compare(spanish, english)).toEqual([]);
  });

  it.each([
    ["public site", es],
    ["admin panel", adminEs],
  ])("%s: no Spanish value is empty", (_name, spanish) => {
    expect(compare(spanish, spanish)).toEqual([]);
  });
});
