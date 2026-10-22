"use client";

import type { Certificate } from "@/generated/prisma/browser";
import type { AdminDictionary } from "@/lib/admin-i18n";

import { createCertificate, updateCertificate } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, monthValue, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["certificateForm"];
  common: AdminDictionary["common"];
  /** The row to edit. Without it the form creates a new one. */
  initial?: Certificate;
};

export default function CertificateForm({ t, common, initial }: Props) {
  const editing = initial !== undefined;
  const { state, pending, formProps } = useAdminForm(
    editing ? updateCertificate : createCertificate,
  );
  // Inside the edit dialog the create form is still on the page behind it.
  const p = editing ? "edit-" : "";

  return (
    <form {...formProps} className="flex flex-col gap-4">
      {editing && <input type="hidden" name="id" value={initial.id} />}

      <BilingualField
        name="title"
        idPrefix={p}
        defaultValue={initial?.title}
        defaultValueEn={initial?.titleEn}
        label={common.title}
        labels={common}
        required
        placeholder="Acquia Certified Drupal Developer"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}issuer`}>{t.issuer}</label>
        <input
          id={`${p}issuer`}
          name="issuer"
          required
          defaultValue={initial?.issuer}
          placeholder={t.issuerPlaceholder}
          className={FIELD}
        />
      </div>

      {/*
        `month` rather than `date`: a certificate is dated to the month, and
        asking for a day invents one. The action pins it to the first.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}issuedAt`}>{t.date}</label>
        <input
          id={`${p}issuedAt`}
          name="issuedAt"
          type="month"
          defaultValue={monthValue(initial?.issuedAt)}
          aria-describedby={`${p}issuedAt-hint`}
          className={FIELD}
        />
        <p id={`${p}issuedAt-hint`} className={HINT}>
          {t.dateHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}credentialId`}>{t.credentialId}</label>
        <input
          id={`${p}credentialId`}
          name="credentialId"
          defaultValue={initial?.credentialId ?? undefined}
          aria-describedby={`${p}credentialId-hint`}
          className={FIELD}
        />
        <p id={`${p}credentialId-hint`} className={HINT}>
          {t.credentialIdHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}credentialUrl`}>{t.credentialUrl}</label>
        <input
          id={`${p}credentialUrl`}
          name="credentialUrl"
          defaultValue={initial?.credentialUrl ?? undefined}
          aria-describedby={`${p}credentialUrl-hint`}
          className={FIELD}
        />
        <p id={`${p}credentialUrl-hint`} className={HINT}>
          {t.credentialUrlHint}
        </p>
      </div>

      {/*
        Optional, unlike the portrait: a certificate with no photo still
        renders as a card, just without the image on top. When editing, an
        empty input keeps the photo that is there.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}image`}>{t.photo}</label>
        <input
          id={`${p}image`}
          name="image"
          type="file"
          accept="image/*"
          aria-describedby={`${p}image-hint`}
          className="text-sm"
        />
        <p id={`${p}image-hint`} className={HINT}>
          {editing && initial.imageUrl ? common.keepImage : t.photoHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${p}position`}>{common.position}</label>
        <input
          id={`${p}position`}
          name="position"
          type="number"
          defaultValue={initial?.position ?? 0}
          aria-describedby={`${p}position-hint`}
          className={`${FIELD} w-24`}
        />
        <p id={`${p}position-hint`} className={HINT}>
          {common.positionHint}
        </p>
      </div>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? common.saving : editing ? common.saveChanges : t.submit}
      </button>
    </form>
  );
}
