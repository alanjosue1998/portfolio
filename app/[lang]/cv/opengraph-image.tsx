/**
 * The same card as the home page. A file-convention image only reaches pages
 * that leave `openGraph` alone, and the CV sets its own — for its title and its
 * URL — so without this file it would be shared with no image at all.
 */
export { default, generateImageMetadata } from "../opengraph-image";
