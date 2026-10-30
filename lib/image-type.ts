export type ImageType = { mime: string; extension: string };

/**
 * For the `accept` of the file inputs, so the picker offers what
 * `sniffImageType` will take. Only a hint: the check that counts runs on the
 * server, on the bytes.
 */
export const IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp,image/avif";

/**
 * What an uploaded image really is, read from its first bytes rather than from
 * the `Content-Type` or the file name — both of which the client sends and
 * either of which can lie.
 *
 * Only raster formats a browser shows in an `<img>`. SVG is left out on
 * purpose: it is a document that can carry script, and served from the blob
 * store's origin it would run there. Anything not recognised is null.
 *
 * `bytes` needs the first 12 bytes of the file; more is fine.
 */
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }

  if (ascii(0, 8) === "\x89PNG\r\n\x1a\n") {
    return { mime: "image/png", extension: "png" };
  }

  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") {
    return { mime: "image/gif", extension: "gif" };
  }

  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { mime: "image/webp", extension: "webp" };
  }

  // An ISO media file whose major brand is AVIF: a still image or a sequence.
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) {
    return { mime: "image/avif", extension: "avif" };
  }

  return null;
}
