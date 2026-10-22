"use client";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { createEducation } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["educationForm"];
  common: AdminDictionary["common"];
};

export default function EducationForm({ t, common }: Props) {
  const { state, pending, formProps } = useAdminForm(createEducation);

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <BilingualField
        name="degree"
        label={t.degree}
        labels={common}
        required
        placeholder={t.degreePlaceholder}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="institution">{t.institution}</label>
        <input id="institution" name="institution" required className={FIELD} />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="startedAt">{common.from}</label>
          <input id="startedAt" name="startedAt" type="month" required className={FIELD} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="endedAt">{common.to}</label>
          <input
            id="endedAt"
            name="endedAt"
            type="month"
            aria-describedby="endedAt-hint"
            className={FIELD}
          />
          <p id="endedAt-hint" className={HINT}>
            {common.toHint}
          </p>
        </div>
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
