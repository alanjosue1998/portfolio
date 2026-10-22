"use client";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { createExperience } from "./actions";
import { FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["experienceForm"];
  common: AdminDictionary["common"];
};

export default function ExperienceForm({ t, common }: Props) {
  const { state, pending, formProps } = useAdminForm(createExperience);

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="role">{t.role}</label>
        <input id="role" name="role" required placeholder={t.rolePlaceholder} className={FIELD} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="company">{t.company}</label>
        <input id="company" name="company" required className={FIELD} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location">{t.location}</label>
        <input
          id="location"
          name="location"
          placeholder={t.locationPlaceholder}
          aria-describedby="location-hint"
          className={FIELD}
        />
        <p id="location-hint" className={HINT}>
          {common.optional}
        </p>
      </div>

      {/* `month`, like the certificate date: a CV dates a job to the month. */}
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
        <label htmlFor="description">{common.description}</label>
        <textarea id="description" name="description" rows={4} required className={FIELD} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="technologies">{common.technologies}</label>
        <input
          id="technologies"
          name="technologies"
          placeholder="Drupal, PHP, Twig"
          aria-describedby="technologies-hint"
          className={FIELD}
        />
        <p id="technologies-hint" className={HINT}>
          {common.technologiesHint}
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
