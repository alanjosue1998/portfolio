"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

export type MenuLabels = {
  open: string;
  close: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
};

type Props = {
  labels: MenuLabels;
  /** The language switcher, rendered on the server and handed in. */
  children: React.ReactNode;
};

const THEMES: Theme[] = ["light", "dark", "system"];

/**
 * The chosen theme lives on `<html>` rather than in React state. The inline
 * script in `ThemeScript` puts it there before React exists, the CSS reads it,
 * and this component subscribes to it — so the attribute is the single source
 * of truth and there is no second copy to drift out of sync.
 */
function readTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;

  return chosen === "light" || chosen === "dark" ? chosen : "system";
}

/** Nothing is chosen while rendering on the server, so the system decides. */
function readServerTheme(): Theme {
  return "system";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Another tab choosing a theme writes to storage, not to this document.
  window.addEventListener("storage", onChange);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
  };
}

function applyTheme(next: Theme) {
  const root = document.documentElement;

  try {
    if (next === "system") {
      // Removing the attribute hands the decision back to the media query.
      delete root.dataset.theme;
      localStorage.removeItem("theme");
    } else {
      root.dataset.theme = next;
      localStorage.setItem("theme", next);
    }
  } catch {
    // Storage blocked: the colours still change, only the memory of it is lost.
  }
}

export default function Menu({ labels, children }: Props) {
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(subscribe, readTheme, readServerTheme);
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
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">{labels.theme}</p>

            <div className="flex gap-1">
              {THEMES.map((option) => {
                const selected = theme === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => applyTheme(option)}
                    aria-pressed={selected}
                    className={`flex-1 rounded border px-2 py-1 text-sm ${
                      selected
                        ? "border-accent font-semibold text-accent"
                        : "border-border text-foreground"
                    }`}
                  >
                    {labels[option]}
                  </button>
                );
              })}
            </div>
          </div>

          {children}
        </div>
      )}
    </div>
  );
}
