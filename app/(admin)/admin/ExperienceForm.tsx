"use client";

import type { Experience } from "@/generated/prisma/browser";
import type { AdminDictionary } from "@/lib/admin-i18n";

import { createExperience, updateExperience } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, monthValue, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["experienceForm"];
  common: AdminDictionary["common"];
  /** The row to edit. Without it the form creates a new one. */
  initial?: Experience;
};

export default function ExperienceForm({ t, common, initial }: Props) {
  const editing = initial !== undefined;
  const { state, pending, formProps } = useAdminForm(editing ? updateExperience : createExperience);
  // Inside the edit dialog the create form is still on the page behind it.
  const p = editing ? "edit-" : "";

  return (
    <form {...formProps} className="flex flex-col gap-4">
      {editing && <input type="hidden" name="id" value={initial.id} />}

      <BilingualField
        name="role"
        idPrefix={p}
        defaultValue={initial?.role}
        defaultValueEn={initial?.roleEn}
        label={t.role}
        labels={common}
        required
        placeholder={t.rolePlaceholder}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}company`}>{t.company}</label>
        <input
          id={`${p}company`}
          name="company"
          required
          defaultValue={initial?.company}
          className={FIELD}
        />
      </div>

      <BilingualField
        name="location"
        idPrefix={p}
        defaultValue={initial?.location}
        defaultValueEn={initial?.locationEn}
        label={t.location}
        labels={common}
        placeholder={t.locationPlaceholder}
        hint={common.optional}
      />

      {/* `month`, like the certificate date: a CV dates a job to the month. */}
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

      <BilingualField
        name="description"
        idPrefix={p}
        defaultValue={initial?.description}
        defaultValueEn={initial?.descriptionEn}
        label={common.description}
        labels={common}
        required
        rows={4}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}technologies`}>{common.technologies}</label>
        <input
          id={`${p}technologies`}
          name="technologies"
          defaultValue={initial?.technologies.join(", ")}
          placeholder="Drupal, PHP, Twig"
          aria-describedby={`${p}technologies-hint`}
          className={FIELD}
        />
        <p id={`${p}technologies-hint`} className={HINT}>
          {common.technologiesHint}
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
