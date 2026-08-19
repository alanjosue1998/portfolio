"use client";

import { useActionState } from "react";

import { saveAbout, type FormState } from "./actions";

const initialState: FormState = undefined;

const fieldClass = "rounded border border-gray-400 px-3 py-2";

type Props = {
  /** What is stored now, per locale. Null when nothing has been written. */
  current: { es: string | null; en: string | null };
  /** The paragraphs in `dictionaries/*.json`, shown as what a blank field
      falls back to. */
  fallback: { es: string; en: string };
};

export default function AboutForm({ current, fallback }: Props) {
  const [state, action, pending] = useActionState(saveAbout, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="aboutEs">Español</label>
        <textarea
          id="aboutEs"
          name="aboutEs"
          rows={5}
          defaultValue={current.es ?? ""}
          placeholder={fallback.es}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="aboutEn">Inglés</label>
        <textarea
          id="aboutEn"
          name="aboutEn"
          rows={5}
          defaultValue={current.en ?? ""}
          placeholder={fallback.en}
          className={fieldClass}
        />
      </div>

      <p className="text-sm text-gray-500">
        Uno por idioma: cada visitante lee el que corresponde a la página en la que está. Un campo
        vacío usa el texto de ejemplo que aparece en gris, que es el que trae el sitio. Las líneas
        en blanco se respetan como saltos de párrafo.
      </p>

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
        {pending ? "Guardando…" : "Guardar texto"}
      </button>
    </form>
  );
}
