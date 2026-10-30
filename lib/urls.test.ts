import { describe, expect, it } from "vitest";

import { normaliseUrl } from "./urls";

describe("normaliseUrl", () => {
  describe("web addresses", () => {
    it("adds https:// to a bare domain", () => {
      expect(normaliseUrl("github.com/me", "github")).toBe("https://github.com/me");
    });

    it("keeps an https URL as it is", () => {
      expect(normaliseUrl("https://linkedin.com/in/me", "linkedin")).toBe(
        "https://linkedin.com/in/me",
      );
    });

    it("trims surrounding whitespace", () => {
      expect(normaliseUrl("  example.com  ", "other")).toBe("https://example.com/");
    });

    it("rejects http:", () => {
      expect(normaliseUrl("http://example.com", "other")).toBeNull();
    });

    it("rejects javascript:", () => {
      expect(normaliseUrl("javascript:alert(1)", "other")).toBeNull();
      expect(normaliseUrl("JavaScript:alert(1)", "other")).toBeNull();
    });

    it("rejects data: and other schemes", () => {
      expect(normaliseUrl("data:text/html,<script>alert(1)</script>", "other")).toBeNull();
      expect(normaliseUrl("ftp://example.com", "other")).toBeNull();
    });

    it("does not turn a mailto: link into a web address", () => {
      expect(normaliseUrl("mailto:me@example.com", "github")).toBeNull();
    });

    it("rejects garbage", () => {
      expect(normaliseUrl("not a url", "other")).toBeNull();
      expect(normaliseUrl("https://", "other")).toBeNull();
    });

    it("rejects an empty value", () => {
      expect(normaliseUrl("", "other")).toBeNull();
      expect(normaliseUrl("   ", "other")).toBeNull();
    });
  });

  describe("email", () => {
    it("turns a bare address into mailto:", () => {
      expect(normaliseUrl("me@example.com", "email")).toBe("mailto:me@example.com");
    });

    it("round-trips a mailto: link", () => {
      expect(normaliseUrl("mailto:me@example.com", "email")).toBe("mailto:me@example.com");
      expect(normaliseUrl("MAILTO:me@example.com", "email")).toBe("mailto:me@example.com");
    });

    it("rejects something that cannot be an address", () => {
      expect(normaliseUrl("me@example", "email")).toBeNull();
      expect(normaliseUrl("me example.com", "email")).toBeNull();
      expect(normaliseUrl("javascript:alert(1)", "email")).toBeNull();
    });

    it("rejects an empty value", () => {
      expect(normaliseUrl("", "email")).toBeNull();
    });
  });
});
