"use client";

import Image from "next/image";
import { useRef } from "react";

export type CertificateImageLabels = {
  view: string;
  close: string;
};

type Props = {
  src: string;
  /** The certificate's title — what the enlarged image is announced as. */
  title: string;
  labels: CertificateImageLabels;
};

/**
 * The photo on a certificate card, and the viewer behind it.
 *
 * A certificate is a document: at card size it is a picture of some text, and
 * the text is the point. Clicking it opens the same file at whatever size the
 * screen allows.
 */
export default function CertificateImage({ src, title, labels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`${labels.view}: ${title}`}
        className="group block w-full cursor-zoom-in"
      >
        {/*
          `aspect-[4/3]` fixes the frame so a mix of portrait and landscape
          scans still lines up across the grid, and `object-cover` crops rather
          than squashing them to fit — the whole thing is one click away.

          The alt is empty on purpose: the title sits directly below and the
          button already carries a label, so a screen reader has the name twice
          before ever reaching the image.
        */}
        <Image
          src={src}
          alt=""
          width={640}
          height={480}
          sizes="(min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] w-full object-cover transition-opacity group-hover:opacity-90"
        />
      </button>

      {/*
        A native <dialog> opened with `showModal`: the focus trap, Escape and
        the inert page behind it come from the browser rather than being
        reimplemented here.
      */}
      <dialog
        ref={dialog}
        /**
         * Any click closes it, the image included. A viewer is a detour, and
         * the way out of a detour should not be a target to aim at.
         */
        onClick={() => dialog.current?.close()}
        className="m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-black/85 open:flex"
      >
        <div className="relative h-full w-full">
          {/*
            `fill` with `object-contain` rather than a declared width and
            height: the frame is the screen and the file's own proportions
            decide what fits inside it, so a tall scan is never cropped to a
            shape it does not have.
          */}
          <Image src={src} alt={title} fill sizes="100vw" className="object-contain" />
        </div>

        {/*
          First focusable thing in the dialog, which is what the browser
          focuses on opening — closing is the safe place to land. The click
          would bubble to the dialog anyway; the handler is here so the button
          does not read as decoration.
        */}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label={labels.close}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </dialog>
    </>
  );
}
