"use client";

import { useActionState } from "react";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { createEducation } from "./actions";
import type { FormState } from "./actions";
import { FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";

const initialState: FormState = undefined;

type Props = {
  t: AdminDictionary["educationForm"];
  common: AdminDictionary["common"];
};

export default function EducationForm({ t, common }: Props) {
  const [state, action, pending] = useActionState(createEducation, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="degree">{t.degree}</label>
        <input
          id="degree"
          name="degree"
          required
          placeholder={t.degreePlaceholder}
          className={FIELD}
        />
      </div>

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
