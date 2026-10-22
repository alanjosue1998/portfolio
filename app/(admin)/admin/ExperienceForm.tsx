"use client";

import { useActionState } from "react";

import { createExperience } from "./actions";
import type { FormState } from "./actions";

const initialState: FormState = undefined;

const fieldClass = "rounded border border-gray-400 px-3 py-2";

export default function ExperienceForm() {
  const [state, action, pending] = useActionState(createExperience, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="role">Cargo</label>
        <input
          id="role"
          name="role"
          required
          placeholder="Desarrollador Drupal"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="company">Empresa</label>
        <input id="company" name="company" required className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location">Ubicación</label>
        <input
          id="location"
          name="location"
          placeholder="Quito, Ecuador · Remoto"
          aria-describedby="location-hint"
          className={fieldClass}
        />
        <p id="location-hint" className="text-sm text-gray-500">
          Opcional.
        </p>
      </div>

      {/* `month`, like the certificate date: a CV dates a job to the month. */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="startedAt">Desde</label>
          <input id="startedAt" name="startedAt" type="month" required className={fieldClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="endedAt">Hasta</label>
          <input
            id="endedAt"
            name="endedAt"
            type="month"
            aria-describedby="endedAt-hint"
            className={fieldClass}
          />
          <p id="endedAt-hint" className="text-sm text-gray-500">
            Vacío si sigue en curso.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" rows={4} required className={fieldClass} />
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

      <div className="flex flex-col gap-1">
        <label htmlFor="position">Posición</label>
        <input
          id="position"
          name="position"
          type="number"
          defaultValue={0}
          aria-describedby="position-hint"
          className={fieldClass}
        />
        <p id="position-hint" className="text-sm text-gray-500">
          Menor primero. Los empates se ordenan por fecha de creación.
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
        {pending ? "Guardando…" : "Añadir experiencia"}
      </button>
    </form>
  );
}
