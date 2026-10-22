"use client";

import type { Education } from "@/generated/prisma/browser";
import type { AdminDictionary } from "@/lib/admin-i18n";

import { createEducation, updateEducation } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, monthValue, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["educationForm"];
  common: AdminDictionary["common"];
  /** The row to edit. Without it the form creates a new one. */
  initial?: Education;
};

export default function EducationForm({ t, common, initial }: Props) {
  const editing = initial !== undefined;
  const { state, pending, formProps } = useAdminForm(editing ? updateEducation : createEducation);
  // Inside the edit dialog the create form is still on the page behind it.
  const p = editing ? "edit-" : "";

  return (
    <form {...formProps} className="flex flex-col gap-4">
      {editing && <input type="hidden" name="id" value={initial.id} />}

      <BilingualField
        name="degree"
        idPrefix={p}
        defaultValue={initial?.degree}
        defaultValueEn={initial?.degreeEn}
        label={t.degree}
        labels={common}
        required
        placeholder={t.degreePlaceholder}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}institution`}>{t.institution}</label>
        <input
          id={`${p}institution`}
          name="institution"
          required
          defaultValue={initial?.institution}
          className={FIELD}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${p}startedAt`}>{common.from}</label>
          <input
            id={`${p}startedAt`}
            name="startedAt"
            type="month"
            required
            defaultValue={monthValue(initial?.startedAt)}
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${p}endedAt`}>{common.to}</label>
          <input
            id={`${p}endedAt`}
            name="endedAt"
            type="month"
            defaultValue={monthValue(initial?.endedAt)}
            aria-describedby={`${p}endedAt-hint`}
            className={FIELD}
          />
          <p id={`${p}endedAt-hint`} className={HINT}>
            {common.toHint}
          </p>
        </div>
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
