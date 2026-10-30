import { describe, expect, it } from "vitest";

import { sniffImageType } from "./image-type";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(
    parts.flatMap((part) =>
      typeof part === "string" ? [...part].map((char) => char.charCodeAt(0)) : part,
    ),
  );

describe("sniffImageType", () => {
  it("recognises JPEG", () => {
    expect(sniffImageType(bytes([0xff, 0xd8, 0xff, 0xe0], "JFIF"))).toEqual({
      mime: "image/jpeg",
      extension: "jpg",
    });
  });

  it("recognises PNG", () => {
    expect(sniffImageType(bytes("\x89PNG\r\n\x1a\n", "IHDR"))?.mime).toBe("image/png");
  });

  it("recognises GIF", () => {
    expect(sniffImageType(bytes("GIF89a", [0, 0, 0, 0, 0, 0]))?.mime).toBe("image/gif");
  });

  it("recognises WebP", () => {
    expect(sniffImageType(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))?.mime).toBe("image/webp");
  });

  it("recognises AVIF", () => {
    expect(sniffImageType(bytes([0, 0, 0, 0x1c], "ftypavif"))?.mime).toBe("image/avif");
  });

  it("rejects SVG, even one that starts like an image file", () => {
    expect(sniffImageType(bytes('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull();
    expect(sniffImageType(bytes('<?xml version="1.0"?><svg>'))).toBeNull();
  });

  it("rejects HTML", () => {
    expect(sniffImageType(bytes("<!doctype html><script>"))).toBeNull();
  });

  it("rejects a RIFF file that is not WebP", () => {
    expect(sniffImageType(bytes("RIFF", [0, 0, 0, 0], "WAVEfmt "))).toBeNull();
  });

  it("rejects an ISO media file that is not AVIF", () => {
    expect(sniffImageType(bytes([0, 0, 0, 0x18], "ftypmp42"))).toBeNull();
  });

  it("rejects an empty or truncated file", () => {
    expect(sniffImageType(new Uint8Array())).toBeNull();
    expect(sniffImageType(bytes([0xff, 0xd8]))).toBeNull();
  });
});
