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

  await prisma.project.create({
    data: { title, type, description, technologies },
  });

  revalidateSite();

  return { status: "ok", message: `Se añadió “${title}”.` };
}

export async function deleteProject(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.project.delete({ where: { id } });

  revalidateSite();
}

/**
 * Kept under Vercel's 4.5MB request ceiling so the action can answer with the
 * message below instead of the upload dying in the platform.
 */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export async function saveProfileImage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Elige una imagen." };
  }

  if (!file.type.startsWith("image/")) {
    return { status: "error", message: "El archivo tiene que ser una imagen." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { status: "error", message: "La imagen no puede pasar de 4 MB." };
  }

  /**
   * `addRandomSuffix` keeps a re-upload from colliding with the previous file,
   * and means the new URL differs from the old one — so the CDN and every
   * browser that cached the last portrait fetch this one instead of serving a
   * stale copy from the same address.
   */
  let uploaded;

  try {
    uploaded = await put(`profile/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
  } catch (error) {
    /**
     * Letting this throw hands the admin a runtime error page over a form that
     * was working a second ago.
     *
     * The message is passed through rather than replaced with a guess. An
     * earlier version blamed a missing `BLOB_READ_WRITE_TOKEN` for every
     * failure, which sent the reader hunting for a token that was already
     * there while the store quietly rejected public uploads. This page is
     * behind a session and the SDK's errors name configuration, not secrets.
     */
    console.error("Blob upload failed", error);

    return {
      status: "error",
      message: `No se pudo subir la imagen. ${error instanceof Error ? error.message : String(error)}`,
    };
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
