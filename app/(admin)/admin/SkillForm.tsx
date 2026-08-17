"use client";

import { useActionState } from "react";

import { createSkill, type FormState } from "./actions";

const initialState: FormState = undefined;

const fieldClass = "rounded border border-gray-400 px-3 py-2";

/**
 * `categories` are the ones already in use, passed down so the input can offer
 * them without forcing them. A `datalist` suggests rather than constrains,
 * which matches the schema — `category` is a free string, so a new grouping is
 * something you type once and then get offered from then on.
 */
export default function SkillForm({ categories }: { categories: string[] }) {
  const [state, action, pending] = useActionState(createSkill, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" required placeholder="Drupal" className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category">Categoría</label>
        <input
          id="category"
          name="category"
          required
          list="skill-categories"
          placeholder="CMS"
          aria-describedby="category-hint"
          className={fieldClass}
        />
        <datalist id="skill-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <p id="category-hint" className="text-sm text-gray-500">
          Agrupa las etiquetas en el sitio. Escribe una nueva o elige una existente.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="position">Orden</label>
        <input
          id="position"
          name="position"
          type="number"
          defaultValue={0}
          className={`${fieldClass} w-24`}
        />
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
        {pending ? "Guardando…" : "Añadir skill"}
      </button>
    </form>
  );
}
