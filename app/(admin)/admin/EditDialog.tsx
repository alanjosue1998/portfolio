"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";

import { CloseIcon } from "@/app/components/icons";

/**
 * Lets a form inside the dialog close it once its action has saved — see
 * `useAdminForm`. Null outside a dialog, where there is nothing to close.
 */
const CloseDialog = createContext<(() => void) | null>(null);

export function useCloseDialog() {
  return useContext(CloseDialog);
}

type Props = {
  /** The text on the button that opens it. */
  trigger: string;
  title: string;
  /** The accessible name of the close button. */
  cancel: string;
  /** The edit form, already filled in with the row's current values. */
  children: React.ReactNode;
};

/**
 * "Edit" on a row of an admin list: a modal holding the same form that creates
 * the row, filled in with what is stored.
 *
 * A native `<dialog>` opened with `showModal()`, so the browser does the hard
 * parts — focus moves in and is kept there, Escape closes it, the page behind
 * is inert — the same element the public site uses for certificate photos.
 *
 * The form is only mounted while the dialog is open. Its fields are
 * uncontrolled, so a form left mounted would reopen showing whatever was typed
 * and abandoned last time, instead of what is saved now.
 */
export default function EditDialog({ trigger, title, cancel, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();

  // `showModal` needs the element on the page, so it waits for the render
  // that mounts the form.
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        // "Edit" alone is the same on every row; the title says which one, and
        // starts with the visible word so voice control still finds it.
        aria-label={title}
        className="text-sm underline"
      >
        {trigger}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Fires however it closes — Escape, the button, a save — so the form
        // unmounts on every path.
        onClose={() => setOpen(false)}
        /*
         * A click on the backdrop lands on the `<dialog>` itself; a click
         * anywhere in the panel lands on the wrapper inside it. Hence the
         * padding on the wrapper rather than on the dialog.
         */
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
      >
        {open && (
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label={cancel}
                className="-m-1 rounded p-1 text-muted hover:text-foreground"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <CloseDialog.Provider value={close}>{children}</CloseDialog.Provider>
          </div>
        )}
      </dialog>
    </>
  );
}
