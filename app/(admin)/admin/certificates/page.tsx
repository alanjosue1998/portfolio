import Image from "next/image";

import { fill, getAdminDictionary, getAdminLocale } from "@/lib/admin-i18n";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import CertificateForm from "../CertificateForm";
import DeleteButton from "../DeleteButton";
import EditDialog from "../EditDialog";
import { deleteCertificate } from "../actions";
import { ITEM } from "../form-ui";

export default async function CertificatesPage() {
  await requireSession();

  const [dict, locale, certificates] = await Promise.all([
    getAdminDictionary(),
    getAdminLocale(),
    prisma.certificate.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  /** Month and year, in the panel's language. UTC for the reason `Certificates` gives. */
  const month = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{dict.certificates.add}</h2>
        <CertificateForm t={dict.certificateForm} common={dict.common} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          {dict.certificates.published} ({certificates.length})
        </h2>

        {certificates.length === 0 ? (
          <p className="text-muted">{dict.certificates.empty}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {certificates.map((certificate) => (
              <li key={certificate.id} className={ITEM}>
                <div className="flex min-w-0 gap-4">
                  {certificate.imageUrl && (
                    <Image
                      src={certificate.imageUrl}
                      alt=""
                      width={80}
                      height={80}
                      className="size-20 shrink-0 rounded object-cover"
                    />
                  )}

                  <div className="min-w-0">
                    <p className="text-sm text-muted">
                      {certificate.issuer}
                      {certificate.issuedAt && ` · ${month.format(certificate.issuedAt)}`}
                    </p>
                    <h3 className="font-semibold">
                      {certificate.title}
                      {certificate.titleEn && (
                        <span lang="en" className="font-normal text-muted">
                          {" "}
                          · EN: {certificate.titleEn}
                        </span>
                      )}
                    </h3>

                    {certificate.credentialId && (
                      <p className="text-sm text-muted">{certificate.credentialId}</p>
                    )}

                    {certificate.credentialUrl && (
                      <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm break-all underline"
                      >
                        {certificate.credentialUrl}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <EditDialog
                    trigger={dict.common.edit}
                    title={fill(dict.common.editTitle, { name: certificate.title })}
                    cancel={dict.common.cancel}
                  >
                    <CertificateForm
                      t={dict.certificateForm}
                      common={dict.common}
                      initial={certificate}
                    />
                  </EditDialog>
                  <DeleteButton
                    action={deleteCertificate}
                    id={certificate.id}
                    label={dict.common.delete}
                    confirmation={fill(dict.common.confirmDelete, { name: certificate.title })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
