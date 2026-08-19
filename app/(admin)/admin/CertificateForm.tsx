"use client";

import { useActionState } from "react";

import { createCertificate } from "./actions";
import type { FormState } from "./actions";

const initialState: FormState = undefined;

const fieldClass = "rounded border border-gray-400 px-3 py-2";

export default function CertificateForm() {
  const [state, action, pending] = useActionState(createCertificate, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          name="title"
          required
          placeholder="Acquia Certified Drupal Developer"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="issuer">Entidad</label>
        <input
          id="issuer"
          name="issuer"
          required
          placeholder="Acquia, Platzi, la universidad…"
          className={fieldClass}
        />
      </div>

      {/*
        `month` rather than `date`: a certificate is dated to the month, and
        asking for a day invents one. The action pins it to the first.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor="issuedAt">Fecha</label>
        <input
          id="issuedAt"
          name="issuedAt"
          type="month"
          aria-describedby="issuedAt-hint"
          className={fieldClass}
        />
        <p id="issuedAt-hint" className="text-sm text-gray-500">
          Opcional. Solo mes y año, que es lo que muestra la tarjeta.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="credentialId">ID de credencial</label>
        <input
          id="credentialId"
          name="credentialId"
          aria-describedby="credentialId-hint"
          className={fieldClass}
        />
        <p id="credentialId-hint" className="text-sm text-gray-500">
          Opcional. El código impreso en el certificado.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="credentialUrl">Enlace de verificación</label>
        <input
          id="credentialUrl"
          name="credentialUrl"
          aria-describedby="credentialUrl-hint"
          className={fieldClass}
        />
        <p id="credentialUrl-hint" className="text-sm text-gray-500">
          Opcional. La página donde la entidad confirma la credencial.
        </p>
      </div>

      {/*
        Optional, unlike the portrait: a certificate with no photo still
        renders as a card, just without the image on top.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor="image">Foto</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          aria-describedby="image-hint"
          className="text-sm"
        />
        <p id="image-hint" className="text-sm text-gray-500">
          Opcional. JPG, PNG o WebP, máximo 4 MB. Se puede abrir a pantalla completa desde el sitio,
          así que vale la pena que se lea.
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
        {pending ? "Guardando…" : "Añadir certificado"}
      </button>
    </form>
  );
}
