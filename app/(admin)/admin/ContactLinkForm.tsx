"use client";

import type { AdminDictionary } from "@/lib/admin-i18n";
import { contactPlatforms } from "@/lib/contact-platforms";

import { createContactLink } from "./actions";
import { FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["contactForm"];
  common: AdminDictionary["common"];
};

export default function ContactLinkForm({ t, common }: Props) {
  const { state, pending, formProps } = useAdminForm(createContactLink);

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="platform">{t.platform}</label>
        <select id="platform" name="platform" defaultValue="github" className={FIELD}>
          {contactPlatforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {/* The rest are names, the same in any language. */}
              {platform.value === "other" ? t.otherPlatform : platform.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="label">{t.label}</label>
        <input
          id="label"
          name="label"
          required
          placeholder="GitHub"
          aria-describedby="label-hint"
          className={FIELD}
        />
        <p id="label-hint" className={HINT}>
          {t.labelHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="url">{t.url}</label>
        <input
          id="url"
          name="url"
          required
          placeholder="github.com/alanjosue1998"
          aria-describedby="url-hint"
          className={FIELD}
        />
        <p id="url-hint" className={HINT}>
          {t.urlHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="position">{common.position}</label>
        <input
          id="position"
          name="position"
          type="number"
          defaultValue={0}
          aria-describedby="position-hint"
          className={`${FIELD} w-24`}
        />
        <p id="position-hint" className={HINT}>
          {common.positionHint}
        </p>
      </div>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? common.saving : t.submit}
      </button>
    </form>
  );
}
