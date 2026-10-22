"use client";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { createSkill } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  categories: string[];
  t: AdminDictionary["skillForm"];
  common: AdminDictionary["common"];
};

/**
 * `categories` are the ones already in use, passed down so the input can offer
 * them without forcing them. A `datalist` suggests rather than constrains,
 * which matches the schema — `category` is a free string, so a new grouping is
 * something you type once and then get offered from then on.
 */
export default function SkillForm({ categories, t, common }: Props) {
  const { state, pending, formProps } = useAdminForm(createSkill);

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <BilingualField name="name" label={t.name} labels={common} required placeholder="Drupal" />

      <BilingualField
        name="category"
        label={t.category}
        labels={common}
        required
        placeholder="CMS"
        list="skill-categories"
        hint={t.categoryHint}
      />
      <datalist id="skill-categories">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

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
