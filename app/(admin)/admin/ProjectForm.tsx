"use client";

import type { Project } from "@/generated/prisma/browser";
import type { AdminDictionary } from "@/lib/admin-i18n";

import { createProject, updateProject } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["projectForm"];
  common: AdminDictionary["common"];
  /** The row to edit. Without it the form creates a new one. */
  initial?: Project;
};

export default function ProjectForm({ t, common, initial }: Props) {
  const editing = initial !== undefined;
  const { state, pending, formProps } = useAdminForm(editing ? updateProject : createProject);
  // Inside the edit dialog the create form is still on the page behind it.
  const p = editing ? "edit-" : "";

  return (
    <form {...formProps} className="flex flex-col gap-4">
      {editing && <input type="hidden" name="id" value={initial.id} />}

      <BilingualField
        name="title"
        idPrefix={p}
        defaultValue={initial?.title}
        defaultValueEn={initial?.titleEn}
        label={common.title}
        labels={common}
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}type`}>{t.type}</label>
        <input
          id={`${p}type`}
          name="type"
          required
          defaultValue={initial?.type}
          placeholder="Drupal, WordPress, Next.js…"
          className={FIELD}
        />
      </div>

      <BilingualField
        name="description"
        idPrefix={p}
        defaultValue={initial?.description}
        defaultValueEn={initial?.descriptionEn}
        label={common.description}
        labels={common}
        required
        rows={3}
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

      {/*
        Optional, unlike the portrait: a project with no cover still renders as
        a card, just without the image on top. When editing, an empty input
        keeps the cover that is there.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}image`}>{t.cover}</label>
        <input
          id={`${p}image`}
          name="image"
          type="file"
          accept="image/*"
          aria-describedby={`${p}image-hint`}
          className="text-sm"
        />
        <p id={`${p}image-hint`} className={HINT}>
          {editing && initial.imageUrl ? common.keepImage : t.coverHint}
        </p>
      </div>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? common.saving : editing ? common.saveChanges : t.submit}
      </button>
    </form>
  );
}
