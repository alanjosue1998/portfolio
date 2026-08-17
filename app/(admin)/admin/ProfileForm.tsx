"use client";

import Image from "next/image";
import { useActionState } from "react";

import { saveProfileImage, type FormState } from "./actions";

const initialState: FormState = undefined;

export default function ProfileForm({ imageUrl }: { imageUrl: string | null }) {
  const [state, action, pending] = useActionState(saveProfileImage, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Foto actual"
            width={80}
            height={80}
            className="size-20 rounded-full border border-gray-300 object-cover"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-gray-400 text-xs text-gray-500">
            Sin foto
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="image">Foto de perfil</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required
            aria-describedby="image-hint"
            className="text-sm"
          />
          <p id="image-hint" className="text-sm text-gray-500">
            JPG, PNG o WebP. Máximo 4 MB.
          </p>
        </div>
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
        {pending ? "Subiendo…" : "Guardar foto"}
      </button>
    </form>
  );
}
