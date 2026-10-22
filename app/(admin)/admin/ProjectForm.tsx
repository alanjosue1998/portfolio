"use client";

import { useActionState } from "react";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { createProject, type FormState } from "./actions";
import { FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";

const initialState: FormState = undefined;

type Props = {
  t: AdminDictionary["projectForm"];
  common: AdminDictionary["common"];
};

export default function ProjectForm({ t, common }: Props) {
  const [state, action, pending] = useActionState(createProject, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title">{common.title}</label>
        <input id="title" name="title" required className={FIELD} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="type">{t.type}</label>
        <input
          id="type"
          name="type"
          required
          placeholder="Drupal, WordPress, Next.js…"
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description">{common.description}</label>
        <textarea id="description" name="description" rows={3} required className={FIELD} />
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

      {/*
        Optional, unlike the portrait: a project with no cover still renders as
        a card, just without the image on top.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor="image">{t.cover}</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          aria-describedby="image-hint"
          className="text-sm"
        />
        <p id="image-hint" className={HINT}>
          {t.coverHint}
        </p>
      </div>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? common.saving : t.submit}
      </button>
    </form>
  );
}
