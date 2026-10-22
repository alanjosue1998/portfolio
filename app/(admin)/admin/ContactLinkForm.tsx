"use client";

import type { ContactLink } from "@/generated/prisma/browser";
import type { AdminDictionary } from "@/lib/admin-i18n";
import { contactPlatforms } from "@/lib/contact-platforms";

import { createContactLink, updateContactLink } from "./actions";
import { FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["contactForm"];
  common: AdminDictionary["common"];
  /** The row to edit. Without it the form creates a new one. */
  initial?: ContactLink;
};

export default function ContactLinkForm({ t, common, initial }: Props) {
  const editing = initial !== undefined;
  const { state, pending, formProps } = useAdminForm(
    editing ? updateContactLink : createContactLink,
  );
  // Inside the edit dialog the create form is still on the page behind it.
  const p = editing ? "edit-" : "";

  return (
    <form {...formProps} className="flex flex-col gap-4">
      {editing && <input type="hidden" name="id" value={initial.id} />}

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}platform`}>{t.platform}</label>
        <select
          id={`${p}platform`}
          name="platform"
          defaultValue={initial?.platform ?? "github"}
          className={FIELD}
        >
          {contactPlatforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {/* The rest are names, the same in any language. */}
              {platform.value === "other" ? t.otherPlatform : platform.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}label`}>{t.label}</label>
        <input
          id={`${p}label`}
          name="label"
          required
          defaultValue={initial?.label}
          placeholder="GitHub"
          aria-describedby={`${p}label-hint`}
          className={FIELD}
        />
        <p id={`${p}label-hint`} className={HINT}>
          {t.labelHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}url`}>{t.url}</label>
        <input
          id={`${p}url`}
          name="url"
          required
          // An email is shown as the address, the way it was typed.
          defaultValue={initial?.url.replace(/^mailto:/, "")}
          placeholder="github.com/alanjosue1998"
          aria-describedby={`${p}url-hint`}
          className={FIELD}
        />
        <p id={`${p}url-hint`} className={HINT}>
          {t.urlHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}position`}>{common.position}</label>
        <input
          id={`${p}position`}
          name="position"
          type="number"
          defaultValue={initial?.position ?? 0}
          aria-describedby={`${p}position-hint`}
          className={`${FIELD} w-24`}
        />
        <p id={`${p}position-hint`} className={HINT}>
          {common.positionHint}
        </p>
      </div>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? common.saving : editing ? common.saveChanges : t.submit}
      </button>
    </form>
  );
}
