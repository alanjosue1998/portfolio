"use client";

import type { Skill } from "@/generated/prisma/browser";
import type { AdminDictionary } from "@/lib/admin-i18n";

import { createSkill, updateSkill } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  categories: string[];
  t: AdminDictionary["skillForm"];
  common: AdminDictionary["common"];
  /** The row to edit. Without it the form creates a new one. */
  initial?: Skill;
};

/**
 * `categories` are the ones already in use, passed down so the input can offer
 * them without forcing them. A `datalist` suggests rather than constrains,
 * which matches the schema — `category` is a free string, so a new grouping is
 * something you type once and then get offered from then on.
 */
export default function SkillForm({ categories, t, common, initial }: Props) {
  const editing = initial !== undefined;
  const { state, pending, formProps } = useAdminForm(editing ? updateSkill : createSkill);
  // Inside the edit dialog the create form is still on the page behind it.
  const p = editing ? "edit-" : "";

  return (
    <form {...formProps} className="flex flex-col gap-4">
      {editing && <input type="hidden" name="id" value={initial.id} />}

      <BilingualField
        name="name"
        idPrefix={p}
        defaultValue={initial?.name}
        defaultValueEn={initial?.nameEn}
        label={t.name}
        labels={common}
        required
        placeholder="Drupal"
      />

      <BilingualField
        name="category"
        idPrefix={p}
        defaultValue={initial?.category}
        defaultValueEn={initial?.categoryEn}
        label={t.category}
        labels={common}
        required
        placeholder="CMS"
        list={`${p}skill-categories`}
        hint={t.categoryHint}
      />
      <datalist id={`${p}skill-categories`}>
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

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
