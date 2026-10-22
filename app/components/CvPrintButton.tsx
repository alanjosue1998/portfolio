"use client";

import { BAR_ITEM_PRIMARY } from "./BottomBar";
import { DownloadIcon } from "./icons";

/**
 * Opens the browser's print dialog, where "Save as PDF" turns the CV page into
 * the file. The browser does the typesetting, so no PDF library ships with the
 * site and no font has to be embedded by hand — the `@media print` rules in
 * `app/globals.css` are the whole of the PDF's design.
 */
export default function CvPrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={BAR_ITEM_PRIMARY}>
      <DownloadIcon size={18} />
      {label}
    </button>
  );
}
