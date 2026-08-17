"use client";

import { useActionState } from "react";

import { contactPlatforms } from "@/lib/contact-platforms";

import { createContactLink, type FormState } from "./actions";

const initialState: FormState = undefined;

const fieldClass = "rounded border border-gray-400 px-3 py-2";

export default function ContactLinkForm() {
  const [state, action, pending] = useActionState(createContactLink, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="platform">Plataforma</label>
        <select id="platform" name="platform" defaultValue="github" className={fieldClass}>
          {contactPlatforms.map((platform) => (
            <option key={platform.value} value={platform.value}>
              {platform.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="label">Etiqueta</label>
        <input
          id="label"
          name="label"
          required
          placeholder="GitHub"
          aria-describedby="label-hint"
          className={fieldClass}
        />
        <p id="label-hint" className="text-sm text-gray-500">
          Es lo que se lee en el enlace y lo que anuncia un lector de pantalla.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="url">Dirección</label>
        <input
          id="url"
          name="url"
          required
          placeholder="github.com/alanjosue1998"
          aria-describedby="url-hint"
          className={fieldClass}
        />
        <p id="url-hint" className="text-sm text-gray-500">
          Para email basta el correo. Para el resto se añade https:// si falta.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="position">Orden</label>
        <input
          id="position"
          name="position"
          type="number"
          defaultValue={0}
          aria-describedby="position-hint"
          className={`${fieldClass} w-24`}
        />
        <p id="position-hint" className="text-sm text-gray-500">
          De menor a mayor. Los empates se ordenan por fecha.
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
        {pending ? "Guardando…" : "Añadir contacto"}
      </button>
    </form>
  );
}
