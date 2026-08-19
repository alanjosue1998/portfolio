"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type ProjectState = { status: "error" | "ok"; message: string } | undefined;

/** Every form on the admin page reports back the same way. */
export type FormState = { status: "error" | "ok"; message: string } | undefined;

/**
 * `app/[lang]/layout.tsx` prerenders one page per locale, and Prisma queries
 * are invisible to Next's cache, so an edit here only reaches visitors once
 * those pages are rebuilt.
 */
function revalidateSite() {
  revalidatePath("/[lang]", "page");
}

export async function createProject(
  _previous: ProjectState,
  formData: FormData,
): Promise<ProjectState> {
  /**
   * A Server Action is a public endpoint: anyone can post to it once they know
   * it exists. The check in `proxy.ts` does not cover it, so it happens here.
   */
  await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const technologies = String(formData.get("technologies") ?? "")
    .split(",")
    .map((technology) => technology.trim())
    .filter(Boolean);

  if (!title || !type || !description) {
    return {
      status: "error",
      message: "Título, tipo y descripción son obligatorios.",
    };
  }

  /**
   * The cover is optional, so an empty file input is not an error — only a
   * file that was chosen and then failed to upload is. `uploadImage` cannot
   * tell those apart, hence the check on the entry before calling it.
   */
  const chosen = formData.get("image");
  const hasCover = chosen instanceof File && chosen.size > 0;
  let imageUrl: string | null = null;

  if (hasCover) {
    const uploaded = await uploadImage(chosen, "projects");

    if (!uploaded.ok) {
      return { status: "error", message: uploaded.message };
    }

    imageUrl = uploaded.url;
  }

  await prisma.project.create({
    data: { title, type, description, technologies, imageUrl },
  });

  revalidateSite();

  return { status: "ok", message: `Se añadió “${title}”.` };
}

export async function deleteProject(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const project = await prisma.project.delete({ where: { id } });

  /**
   * Best effort, and deliberately after the row is gone: a cover left in the
   * store is a few stray kilobytes, while a delete that fails here should not
   * keep the project itself on the site.
   */
  if (project.imageUrl) {
    try {
      await del(project.imageUrl);
    } catch {
      // Left behind in the store; harmless.
    }
  }

  revalidateSite();
}

export async function createCertificate(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const issuer = String(formData.get("issuer") ?? "").trim();
  const credentialId = String(formData.get("credentialId") ?? "").trim() || null;
  const rawCredentialUrl = String(formData.get("credentialUrl") ?? "").trim();
  const rawIssuedAt = String(formData.get("issuedAt") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);

  if (!title || !issuer) {
    return {
      status: "error",
      message: "El título y la entidad son obligatorios.",
    };
  }

  /**
   * `<input type="month">` hands back `YYYY-MM`. Pinning it to the first of
   * the month in UTC keeps the stored instant on the month that was typed
   * whatever timezone the server runs in — the public card reads it back the
   * same way.
   */
  let issuedAt: Date | null = null;

  if (rawIssuedAt) {
    const parsed = new Date(`${rawIssuedAt}-01T00:00:00Z`);

    if (Number.isNaN(parsed.getTime())) {
      return { status: "error", message: "La fecha no es válida." };
    }

    issuedAt = parsed;
  }

  /**
   * Optional, so a blank field is not an error — only one that was filled in
   * with something that could not be a link. `certificate` is not `email`,
   * which is all `normaliseUrl` needs to treat it as a web address.
   */
  const credentialUrl = rawCredentialUrl ? normaliseUrl(rawCredentialUrl, "certificate") : null;

  if (rawCredentialUrl && !credentialUrl) {
    return {
      status: "error",
      message: "El enlace de verificación no es válido (https://…).",
    };
  }

  /**
   * The photo is optional, so an empty file input is not an error — only a
   * file that was chosen and then failed to upload is.
   */
  const chosen = formData.get("image");
  let imageUrl: string | null = null;

  if (chosen instanceof File && chosen.size > 0) {
    const uploaded = await uploadImage(chosen, "certificates");

    if (!uploaded.ok) {
      return { status: "error", message: uploaded.message };
    }

    imageUrl = uploaded.url;
  }

  await prisma.certificate.create({
    data: {
      title,
      issuer,
      issuedAt,
      credentialId,
      credentialUrl,
      imageUrl,
      position: Number.isFinite(position) ? position : 0,
    },
  });

  revalidateSite();

  return { status: "ok", message: `Se añadió “${title}”.` };
}

export async function deleteCertificate(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const certificate = await prisma.certificate.delete({ where: { id } });

  /**
   * Best effort, and deliberately after the row is gone: a photo left in the
   * store is a few stray kilobytes, while a delete that fails here should not
   * keep the certificate itself on the site.
   */
  if (certificate.imageUrl) {
    try {
      await del(certificate.imageUrl);
    } catch {
      // Left behind in the store; harmless.
    }
  }

  revalidateSite();
}

export async function createSkill(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);

  if (!name || !category) {
    return { status: "error", message: "Nombre y categoría son obligatorios." };
  }

  await prisma.skill.create({
    data: { name, category, position: Number.isFinite(position) ? position : 0 },
  });

  revalidateSite();

  return { status: "ok", message: `Se añadió “${name}”.` };
}

export async function deleteSkill(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.skill.delete({ where: { id } });

  revalidateSite();
}

/**
 * Kept under Vercel's 4.5MB request ceiling so the action can answer with its
 * own message instead of the upload dying in the platform.
 */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Validates a file off a form and puts it in Vercel Blob.
 *
 * Shared by the portrait, the project cover and the certificate photo,
 * which differ only in the folder they land in. Returns a result rather
 * than throwing so each caller can hand the message straight back to its
 * own form.
 */
async function uploadImage(
  file: FormDataEntryValue | null,
  folder: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Elige una imagen." };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "El archivo tiene que ser una imagen." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "La imagen no puede pasar de 4 MB." };
  }

  try {
    /**
     * `addRandomSuffix` keeps a re-upload from colliding with the previous
     * file, and means the new URL differs from the old one — so the CDN and
     * every browser that cached the last image fetch this one instead of
     * serving a stale copy from the same address.
     */
    const uploaded = await put(`${folder}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return { ok: true, url: uploaded.url };
  } catch (error) {
    /**
     * Letting this throw hands the admin a runtime error page over a form that
     * was working a second ago.
     *
     * The message is passed through rather than replaced with a guess. An
     * earlier version blamed a missing `BLOB_READ_WRITE_TOKEN` for every
     * failure, which sent the reader hunting for a token that was already
     * there while the store quietly rejected public uploads. These pages are
     * behind a session and the SDK's errors name configuration, not secrets.
     */
    console.error("Blob upload failed", error);

    return {
      ok: false,
      message: `No se pudo subir la imagen. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function saveProfileImage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const uploaded = await uploadImage(formData.get("image"), "profile");

  if (!uploaded.ok) {
    return { status: "error", message: uploaded.message };
  }

  const previous = await prisma.profile.findUnique({ where: { id: "main" } });

  await prisma.profile.upsert({
    where: { id: "main" },
    create: { id: "main", imageUrl: uploaded.url },
    update: { imageUrl: uploaded.url },
  });

  /**
   * The new portrait is already live at this point. A blob that fails to delete
   * is a few stray kilobytes in the store, which is not worth showing the user
   * an error over — so the old one is cleaned up on a best-effort basis.
   */
  if (previous?.imageUrl) {
    try {
      await del(previous.imageUrl);
    } catch {
      // Left behind in the store; harmless.
    }
  }

  revalidateSite();

  return { status: "ok", message: "Foto actualizada." };
}

/**
 * `mailto:` and `tel:` have no `//`, so a bare address has to be recognised
 * before it is treated as a web address. Anything without a scheme is assumed
 * to be a site — typing `github.com/me` into the form is the common case.
 */
function normaliseUrl(raw: string, platform: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (platform === "email") {
    const address = value.replace(/^mailto:/i, "");
    // Deliberately loose: the only thing worth rejecting here is a typo that
    // could not possibly be an address.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? `mailto:${address}` : null;
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(withScheme);
    // Anything else — `javascript:` above all — has no business being rendered
    // into an href on the public site.
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function createContactLink(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const platform = String(formData.get("platform") ?? "other").trim();
  const label = String(formData.get("label") ?? "").trim();
  const url = normaliseUrl(String(formData.get("url") ?? ""), platform);
  const position = Number(formData.get("position") ?? 0);

  if (!label) {
    return { status: "error", message: "La etiqueta es obligatoria." };
  }

  if (!url) {
    return {
      status: "error",
      message:
        platform === "email"
          ? "Escribe un correo válido."
          : "Escribe una dirección válida (https://…).",
    };
  }

  await prisma.contactLink.create({
    data: {
      platform,
      label,
      url,
      position: Number.isFinite(position) ? position : 0,
    },
  });

  revalidateSite();

  return { status: "ok", message: `Se añadió “${label}”.` };
}

export async function deleteContactLink(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.contactLink.delete({ where: { id } });

  revalidateSite();
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });

  redirect("/login");
}
