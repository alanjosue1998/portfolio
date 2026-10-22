"use client";

import type { AdminDictionary } from "@/lib/admin-i18n";

import { createCertificate } from "./actions";
import { BilingualField, FIELD, FormStatus, HINT, SUBMIT } from "./form-ui";
import { useAdminForm } from "./use-admin-form";

type Props = {
  t: AdminDictionary["certificateForm"];
  common: AdminDictionary["common"];
};

export default function CertificateForm({ t, common }: Props) {
  const { state, pending, formProps } = useAdminForm(createCertificate);

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <BilingualField
        name="title"
        label={common.title}
        labels={common}
        required
        placeholder="Acquia Certified Drupal Developer"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="issuer">{t.issuer}</label>
        <input
          id="issuer"
          name="issuer"
          required
          placeholder={t.issuerPlaceholder}
          className={FIELD}
        />
      </div>

      {/*
        `month` rather than `date`: a certificate is dated to the month, and
        asking for a day invents one. The action pins it to the first.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor="issuedAt">{t.date}</label>
        <input
          id="issuedAt"
          name="issuedAt"
          type="month"
          aria-describedby="issuedAt-hint"
          className={FIELD}
        />
        <p id="issuedAt-hint" className={HINT}>
          {t.dateHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="credentialId">{t.credentialId}</label>
        <input
          id="credentialId"
          name="credentialId"
          aria-describedby="credentialId-hint"
          className={FIELD}
        />
        <p id="credentialId-hint" className={HINT}>
          {t.credentialIdHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="credentialUrl">{t.credentialUrl}</label>
        <input
          id="credentialUrl"
          name="credentialUrl"
          aria-describedby="credentialUrl-hint"
          className={FIELD}
        />
        <p id="credentialUrl-hint" className={HINT}>
          {t.credentialUrlHint}
        </p>
      </div>

      {/*
        Optional, unlike the portrait: a certificate with no photo still
        renders as a card, just without the image on top.
      */}
      <div className="flex flex-col gap-1">
        <label htmlFor="image">{t.photo}</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          aria-describedby="image-hint"
          className="text-sm"
        />
        <p id="image-hint" className={HINT}>
          {t.photoHint}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="position">{common.position}</label>
        <input
          id="position"
          name="position"
          type="number"
          defaultValue={0}
          aria-describedby="position-hint"
          className={`${FIELD} w-24`}
        />
        <p id="position-hint" className={HINT}>
          {common.positionHint}
        </p>
      </div>

      <FormStatus state={state} />

      <button type="submit" disabled={pending} className={SUBMIT}>
        {pending ? common.saving : t.submit}
      </button>
    </form>
  );
}
