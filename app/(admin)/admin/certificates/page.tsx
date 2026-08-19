import Image from "next/image";

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import CertificateForm from "../CertificateForm";
import { deleteCertificate } from "../actions";

/** Month and year, in the language the admin itself is written in. */
const month = new Intl.DateTimeFormat("es", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function CertificatesPage() {
  await requireSession();

  const certificates = await prisma.certificate.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Añadir un certificado</h2>
        <CertificateForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Publicados ({certificates.length})</h2>

        {certificates.length === 0 ? (
          <p className="text-gray-500">Todavía no hay ninguno.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {certificates.map((certificate) => (
              <li
                key={certificate.id}
                className="flex items-start justify-between gap-4 rounded border border-gray-300 p-4"
              >
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
                    <p className="text-sm text-gray-500">
                      {certificate.issuer}
                      {certificate.issuedAt && ` · ${month.format(certificate.issuedAt)}`}
                    </p>
                    <h3 className="font-semibold">{certificate.title}</h3>

                    {certificate.credentialId && (
                      <p className="text-sm text-gray-500">{certificate.credentialId}</p>
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

                <form action={deleteCertificate}>
                  <input type="hidden" name="id" value={certificate.id} />
                  <button type="submit" className="text-sm text-red-600 underline">
                    Borrar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
