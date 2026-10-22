"use client";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { saveAbout } from "./actions";
import { FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  /** What is stored now, per locale. Null when nothing has been written. */
  current: { es: string | null; en: string | null };
  /** The paragraphs in `dictionaries/*.json`, shown as what a blank field
      falls back to. */
  fallback: { es: string; en: string };
  t: AdminDictionary["aboutForm"];
  saving: string;
};

export default function AboutForm({ current, fallback, t, saving }: Props) {
  const { state, pending, formProps } = useAdminForm(saveAbout, { resetOnSuccess: false });

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="aboutEs">{t.es}</label>
        <textarea
          id="aboutEs"
          name="aboutEs"
          lang="es"
          rows={5}
          defaultValue={current.es ?? ""}
          placeholder={fallback.es}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="aboutEn">{t.en}</label>
        <textarea
          id="aboutEn"
          name="aboutEn"
          lang="en"
          rows={5}
          defaultValue={current.en ?? ""}
          placeholder={fallback.en}
          className={FIELD}
        />
      </div>

      <p className={HINT}>{t.hint}</p>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? saving : t.submit}
      </button>
    </form>
  );
}
