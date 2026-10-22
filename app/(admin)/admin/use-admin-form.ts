import { startTransition, useActionState, useEffect, useRef } from "react";

import type { FormState } from "./actions";

/**
 * Submits a panel form through its Server Action and clears it only once the
 * action has said it worked.
 *
 * `<form action={…}>` cannot do that: React resets an uncontrolled form after
 * every action it runs that way, whatever the action returned. A rejected
 * `http://` link or an end date before the start would wipe everything typed —
 * the chosen file included — and leave the error explaining what was lost.
 * Submitting from `onSubmit` instead skips React's reset, and the effect below
 * does it on success.
 *
 * `resetOnSuccess: false` for forms that edit what is already stored, where
 * the text should stay as saved rather than go blank.
 *
 * In its own file, away from `form-ui.tsx`: the server pages import their class
 * names from there, and a server module cannot import client hooks.
 */
export function useAdminForm(
  action: (state: FormState, formData: FormData) => Promise<FormState>,
  { resetOnSuccess = true }: { resetOnSuccess?: boolean } = {},
) {
  const [state, dispatch, pending] = useActionState(action, undefined);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.status === "ok") form.current?.reset();
  }, [state, resetOnSuccess]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, formProps: { ref: form, onSubmit } };
}
