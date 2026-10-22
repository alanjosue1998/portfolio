"use client";

import { useActionState } from "react";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { createSkill, type FormState } from "./actions";
import { FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";

const initialState: FormState = undefined;

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
  const [state, action, pending] = useActionState(createSkill, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name">{t.name}</label>
        <input id="name" name="name" required placeholder="Drupal" className={FIELD} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category">{t.category}</label>
        <input
          id="category"
          name="category"
          required
          list="skill-categories"
          placeholder="CMS"
          aria-describedby="category-hint"
          className={FIELD}
        />
        <datalist id="skill-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <p id="category-hint" className={HINT}>
          {t.categoryHint}
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
