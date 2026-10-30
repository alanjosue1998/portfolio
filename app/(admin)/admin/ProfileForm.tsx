"use client";

import Image from "next/image";
import type { AdminDictionary } from "@/lib/admin-i18n";
import { IMAGE_TYPES } from "@/lib/image-type";

import { saveProfileImage } from "./actions";
import { FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  imageUrl: string | null;
  t: AdminDictionary["profileForm"];
};

export default function ProfileForm({ imageUrl, t }: Props) {
  const { state, pending, formProps } = useAdminForm(saveProfileImage);

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={t.currentAlt}
            width={80}
            height={80}
            className="size-20 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-field text-xs text-muted">
            {t.noPhoto}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="image">{t.label}</label>
          <input
            id="image"
            name="image"
            type="file"
            accept={IMAGE_TYPES}
            required
            aria-describedby="image-hint"
            className="text-sm"
          />
          <p id="image-hint" className={HINT}>
            {t.hint}
          </p>
        </div>
      </div>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
