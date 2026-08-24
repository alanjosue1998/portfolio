"use client";

import { useEffect, useId, useRef, useState } from "react";

export type MenuLabels = {
  open: string;
  close: string;
};

type Props = {
  labels: MenuLabels;
  /** The language switcher, rendered on the server and handed in. */
  children: React.ReactNode;
};

export default function Menu({ labels, children }: Props) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        className="flex h-10 w-10 items-center justify-center rounded border border-transparent text-foreground hover:border-accent"
      >
        {/* Three bars, drawn rather than pulled from an icon package. */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 z-10 mt-2 flex w-56 flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}
