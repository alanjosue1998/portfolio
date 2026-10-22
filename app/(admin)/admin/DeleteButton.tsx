"use client";

import { DELETE } from "./form-ui";

type Props = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  /** Asked before anything is sent; cancelling sends nothing. */
  confirmation: string;
};

/**
 * "Delete" on a row, behind a confirmation: it sat a few pixels from "Edit",
 * and a delete cannot be undone — for projects and certificates it takes the
 * uploaded image with it. The browser's own `confirm()` is enough here: it is
 * modal, keyboard-friendly and read out, and this is a tool for one person.
 */
export default function DeleteButton({ action, id, label, confirmation }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={DELETE}>
        {label}
      </button>
    </form>
  );
}
