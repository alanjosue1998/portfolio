import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale } from "@/lib/i18n";
import prisma from "@/lib/prisma";

import CertificateImage from "./CertificateImage";

export default async function Certificates() {
  const [dict, locale, certificates] = await Promise.all([
    getDictionary(),
    lang(),
    prisma.certificate.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  // A heading over an empty grid says less than nothing.
  if (certificates.length === 0) return null;

  /**
   * Built once for the whole list rather than per card — a formatter is not
   * cheap to construct.
   *
   * UTC, because the dates go in as a bare first-of-the-month: read back in
   * any timezone behind it, the first of March becomes the last of February
   * and the card prints the wrong month.
   */
  const month = new Intl.DateTimeFormat(locale ?? defaultLocale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="flex flex-col gap-6">
      <h2>{dict.certificates.heading}</h2>

      {/* One column on a phone, two from `sm` up — the same grid as Projects. */}
      <ul className="grid gap-6 sm:grid-cols-2">
        {certificates.map((certificate) => (
          <li
            key={certificate.id}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface"
          >
            {/* Optional, and a card without one has to hold its own rather
                than leave a gap. */}
            {certificate.imageUrl && (
              <CertificateImage
                src={certificate.imageUrl}
                title={certificate.title}
                labels={dict.certificates.image}
              />
            )}

            <div className="flex flex-col gap-2 p-5">
              <p className="text-sm text-muted">
                {certificate.issuer}
                {certificate.issuedAt && ` · ${month.format(certificate.issuedAt)}`}
              </p>

              <h3 className="text-lg">{certificate.title}</h3>

              {certificate.credentialId && (
                <p className="text-sm text-muted">
                  {dict.certificates.credentialId}:{" "}
                  <span className="font-mono">{certificate.credentialId}</span>
                </p>
              )}

              {/* Pushed to the bottom of the card so the link sits on the same
                  line across a row of cards whose text runs to different
                  lengths. */}
              {certificate.credentialUrl && (
                <a
                  href={certificate.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto pt-3 text-sm font-semibold text-accent hover:underline"
                >
                  {dict.certificates.verify} →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
