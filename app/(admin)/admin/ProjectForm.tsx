"use client";

import { useActionState } from "react";

import { createProject, type ProjectState } from "./actions";

const initialState: ProjectState = undefined;

const fieldClass = "rounded border border-gray-400 px-3 py-2";

export default function ProjectForm() {
  const [state, action, pending] = useActionState(createProject, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title">Título</label>
        <input id="title" name="title" required className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="type">Tipo</label>
        <input
          id="type"
          name="type"
          required
          placeholder="Drupal, WordPress, Next.js…"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" rows={3} required className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="technologies">Tecnologías</label>
        <input
          id="technologies"
          name="technologies"
          placeholder="Drupal, PHP, Twig"
          aria-describedby="technologies-hint"
          className={fieldClass}
        />
        <p id="technologies-hint" className="text-sm text-gray-500">
          Separadas por comas.
        </p>
      </div>

      {/*
        Optional, unlike the portrait: a project with no cover still renders as
        a card, just without the image on top.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor="image">Portada</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          aria-describedby="image-hint"
          className="text-sm"
        />
        <p id="image-hint" className="text-sm text-gray-500">
          Opcional. JPG, PNG o WebP, máximo 4 MB.
        </p>
      </div>

      {state && (
        <p role="alert" className={state.status === "error" ? "text-red-600" : "text-green-700"}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-foreground px-4 py-2 text-background disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Añadir proyecto"}
      </button>
    </form>
  );
}
