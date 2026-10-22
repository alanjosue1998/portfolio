"use client";

import { useActionState } from "react";

import { createEducation } from "./actions";
import type { FormState } from "./actions";

const initialState: FormState = undefined;

const fieldClass = "rounded border border-gray-400 px-3 py-2";

export default function EducationForm() {
  const [state, action, pending] = useActionState(createEducation, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="degree">Título</label>
        <input
          id="degree"
          name="degree"
          required
          placeholder="Ingeniería en Sistemas"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="institution">Institución</label>
        <input id="institution" name="institution" required className={fieldClass} />
      </div>

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
        {pending ? "Guardando…" : "Añadir educación"}
      </button>
    </form>
  );
}
