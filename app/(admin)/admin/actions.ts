"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { fill, getAdminDictionary, type AdminDictionary } from "@/lib/admin-i18n";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { normaliseUrl } from "@/lib/urls";

/** Every form on the admin page reports back the same way. */
export type FormState = { status: "error" | "ok"; message: string } | undefined;

/**
 * `app/[lang]/layout.tsx` prerenders one page per locale, and Prisma queries
 * are invisible to Next's cache, so an edit here only reaches visitors once
 * those pages are rebuilt.
 *
 * `"layout"` rather than `"page"`: it takes every page under the locale with
 * it — the home and the CV alike — so a new route cannot be forgotten here.
 */
function revalidateSite() {
  revalidatePath("/[lang]", "layout");
}

/**
 * The order field, as an `Int` column will take it. `<input type="number">`
 * still lets `1.5` or `1e12` through, and either would fail the insert with an
 * error page instead of a message, so anything that is not a modest whole
 * number counts as the default.
 */
function parsePosition(raw: FormDataEntryValue | null) {
  const value = Number(raw ?? 0);

  return Number.isInteger(value) && Math.abs(value) <= 1_000_000 ? value : 0;
}

/**
 * An optional English version of a field — `roleEn`, `titleEn`… Blank is stored
 * as null, which is what tells the public pages to fall back to the Spanish
 * text. See `localized()` in `lib/i18n.ts`.
 */
function englishText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim() || null;
}

/**
 * Deletes a file from Vercel Blob on a best-effort basis: a file left behind
 * is a few stray kilobytes, which is not worth failing a save that otherwise
 * worked.
 */
async function removeBlob(url: string) {
  try {
    await del(url);
  } catch {
    // Left behind in the store; harmless.
  }
}

/**
 * For deletes: a row that is already gone — a double click, a second tab — is
 * what the delete wanted anyway, not an error page. Prisma reports it as P2025;
 * anything else still throws. The rows with no blob to clean up use
 * `deleteMany`, which simply deletes nothing in that case.
 */
function alreadyGone(error: unknown): null {
  if ((error as { code?: string } | null)?.code === "P2025") return null;

  throw error;
}

async function saveProject(formData: FormData, id: string | null): Promise<FormState> {
  /**
   * A Server Action is a public endpoint: anyone can post to it once they know
   * it exists. The check in `proxy.ts` does not cover it, so it happens here.
   */
  await requireSession();
  const t = (await getAdminDictionary()).actions;

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
      message: t.projectRequired,
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
    const uploaded = await uploadImage(chosen, "projects", t);

    if (!uploaded.ok) {
      return { status: "error", message: uploaded.message };
    }

    imageUrl = uploaded.url;
  }

  const data = {
    title,
    titleEn: englishText(formData, "titleEn"),
    type,
    description,
    descriptionEn: englishText(formData, "descriptionEn"),
    technologies,
    // Left out when no new file was chosen, so an edit keeps the current one.
    ...(imageUrl && { imageUrl }),
  };

  // Read before the update, to clean up the file a new one replaces.
  const previous =
    id !== null && imageUrl
      ? await prisma.project.findUnique({ where: { id }, select: { imageUrl: true } })
      : null;

  const saved =
    id === null
      ? await prisma.project.create({ data })
      : await prisma.project.update({ where: { id }, data }).catch(alreadyGone);

  if (!saved) {
    // The row went while the file was uploading: nothing points at it now.
    if (imageUrl) await removeBlob(imageUrl);

    return { status: "error", message: t.gone };
  }

  if (previous?.imageUrl) await removeBlob(previous.imageUrl);

  revalidateSite();

  return { status: "ok", message: fill(id === null ? t.added : t.updated, { name: title }) };
}

export async function createProject(_previous: FormState, formData: FormData) {
  return saveProject(formData, null);
}

export async function updateProject(_previous: FormState, formData: FormData) {
  return saveProject(formData, String(formData.get("id") ?? ""));
}

export async function deleteProject(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const project = await prisma.project.delete({ where: { id } }).catch(alreadyGone);

  /**
   * Best effort, and deliberately after the row is gone: a cover left in the
   * store is a few stray kilobytes, while a delete that fails here should not
   * keep the project itself on the site.
   */
  if (project?.imageUrl) {
    try {
      await del(project.imageUrl);
    } catch {
      // Left behind in the store; harmless.
    }
  }

  revalidateSite();
}

async function saveCertificate(formData: FormData, id: string | null): Promise<FormState> {
  await requireSession();
  const t = (await getAdminDictionary()).actions;

  const title = String(formData.get("title") ?? "").trim();
  const issuer = String(formData.get("issuer") ?? "").trim();
  const credentialId = String(formData.get("credentialId") ?? "").trim() || null;
  const rawCredentialUrl = String(formData.get("credentialUrl") ?? "").trim();
  const rawIssuedAt = String(formData.get("issuedAt") ?? "").trim();
  const position = parsePosition(formData.get("position"));

  if (!title || !issuer) {
    return {
      status: "error",
      message: t.certificateRequired,
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
      return { status: "error", message: t.invalidDate };
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
      message: t.verificationHttps,
    };
  }

  /**
   * The photo is optional, so an empty file input is not an error — only a
   * file that was chosen and then failed to upload is.
   */
  const chosen = formData.get("image");
  let imageUrl: string | null = null;

  if (chosen instanceof File && chosen.size > 0) {
    const uploaded = await uploadImage(chosen, "certificates", t);

    if (!uploaded.ok) {
      return { status: "error", message: uploaded.message };
    }

    imageUrl = uploaded.url;
  }

  const data = {
    title,
    titleEn: englishText(formData, "titleEn"),
    issuer,
    issuedAt,
    credentialId,
    credentialUrl,
    // Left out when no new file was chosen, so an edit keeps the current one.
    ...(imageUrl && { imageUrl }),
    position,
  };

  // Read before the update, to clean up the file a new one replaces.
  const previous =
    id !== null && imageUrl
      ? await prisma.certificate.findUnique({ where: { id }, select: { imageUrl: true } })
      : null;

  const saved =
    id === null
      ? await prisma.certificate.create({ data })
      : await prisma.certificate.update({ where: { id }, data }).catch(alreadyGone);

  if (!saved) {
    // The row went while the file was uploading: nothing points at it now.
    if (imageUrl) await removeBlob(imageUrl);

    return { status: "error", message: t.gone };
  }

  if (previous?.imageUrl) await removeBlob(previous.imageUrl);

  revalidateSite();

  return { status: "ok", message: fill(id === null ? t.added : t.updated, { name: title }) };
}

export async function createCertificate(_previous: FormState, formData: FormData) {
  return saveCertificate(formData, null);
}

export async function updateCertificate(_previous: FormState, formData: FormData) {
  return saveCertificate(formData, String(formData.get("id") ?? ""));
}

export async function deleteCertificate(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const certificate = await prisma.certificate.delete({ where: { id } }).catch(alreadyGone);

  /**
   * Best effort, and deliberately after the row is gone: a photo left in the
   * store is a few stray kilobytes, while a delete that fails here should not
   * keep the certificate itself on the site.
   */
  if (certificate?.imageUrl) {
    try {
      await del(certificate.imageUrl);
    } catch {
      // Left behind in the store; harmless.
    }
  }

  revalidateSite();
}

async function saveSkill(formData: FormData, id: string | null): Promise<FormState> {
  await requireSession();
  const t = (await getAdminDictionary()).actions;

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const position = parsePosition(formData.get("position"));

  if (!name || !category) {
    return { status: "error", message: t.skillRequired };
  }

  const data = {
    name,
    nameEn: englishText(formData, "nameEn"),
    category,
    categoryEn: englishText(formData, "categoryEn"),
    position,
  };

  const saved =
    id === null
      ? await prisma.skill.create({ data })
      : await prisma.skill.update({ where: { id }, data }).catch(alreadyGone);

  if (!saved) return { status: "error", message: t.gone };

  revalidateSite();

  return { status: "ok", message: fill(id === null ? t.added : t.updated, { name }) };
}

export async function createSkill(_previous: FormState, formData: FormData) {
  return saveSkill(formData, null);
}

export async function updateSkill(_previous: FormState, formData: FormData) {
  return saveSkill(formData, String(formData.get("id") ?? ""));
}

export async function deleteSkill(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.skill.deleteMany({ where: { id } });

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
  t: AdminDictionary["actions"],
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: t.chooseImage };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, message: t.notImage };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: t.imageTooBig };
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
      message: `${t.uploadFailed} ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function saveProfileImage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();
  const t = (await getAdminDictionary()).actions;

  const uploaded = await uploadImage(formData.get("image"), "profile", t);

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

  return { status: "ok", message: t.photoUpdated };
}

export async function saveAbout(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireSession();
  const t = (await getAdminDictionary()).actions;

  /**
   * Stored as null rather than as an empty string: `app/components/About.tsx`
   * falls back to the dictionary, and clearing the field is how you ask for
   * that text back.
   */
  const aboutEs = String(formData.get("aboutEs") ?? "").trim() || null;
  const aboutEn = String(formData.get("aboutEn") ?? "").trim() || null;

  await prisma.profile.upsert({
    where: { id: "main" },
    create: { id: "main", aboutEs, aboutEn },
    update: { aboutEs, aboutEn },
  });

  revalidateSite();

  return { status: "ok", message: t.textUpdated };
}

async function saveContactLink(formData: FormData, id: string | null): Promise<FormState> {
  await requireSession();
  const t = (await getAdminDictionary()).actions;

  const platform = String(formData.get("platform") ?? "other").trim();
  const label = String(formData.get("label") ?? "").trim();
  const url = normaliseUrl(String(formData.get("url") ?? ""), platform);
  const position = parsePosition(formData.get("position"));

  if (!label) {
    return { status: "error", message: t.labelRequired };
  }

  if (!url) {
    return {
      status: "error",
      message: platform === "email" ? t.invalidEmail : t.invalidUrl,
    };
  }

  const data = {
    platform,
    label,
    url,
    position,
  };

  const saved =
    id === null
      ? await prisma.contactLink.create({ data })
      : await prisma.contactLink.update({ where: { id }, data }).catch(alreadyGone);

  if (!saved) return { status: "error", message: t.gone };

  revalidateSite();

  return { status: "ok", message: fill(id === null ? t.added : t.updated, { name: label }) };
}

export async function createContactLink(_previous: FormState, formData: FormData) {
  return saveContactLink(formData, null);
}

export async function updateContactLink(_previous: FormState, formData: FormData) {
  return saveContactLink(formData, String(formData.get("id") ?? ""));
}

export async function deleteContactLink(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.contactLink.deleteMany({ where: { id } });

  revalidateSite();
}

/**
 * `<input type="month">` hands back `YYYY-MM`, pinned here to the first of the
 * month in UTC, the same way `createCertificate` stores `issuedAt`. Blank is
 * `null`; anything unparseable is `undefined`, so the caller can tell the two
 * apart.
 */
function parseMonth(raw: FormDataEntryValue | null): Date | null | undefined {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  const parsed = new Date(`${value}-01T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Shared by experience and education: a start is required, an end is optional
 * (ongoing), and the end cannot come before the start.
 */
function parsePeriod(
  formData: FormData,
  t: AdminDictionary["actions"],
): { ok: true; startedAt: Date; endedAt: Date | null } | { ok: false; message: string } {
  const startedAt = parseMonth(formData.get("startedAt"));
  const endedAt = parseMonth(formData.get("endedAt"));

  if (!startedAt) {
    return { ok: false, message: t.startRequired };
  }

  if (endedAt === undefined) {
    return { ok: false, message: t.invalidEnd };
  }

  if (endedAt && endedAt < startedAt) {
    return { ok: false, message: t.endBeforeStart };
  }

  return { ok: true, startedAt, endedAt };
}

async function saveExperience(formData: FormData, id: string | null): Promise<FormState> {
  await requireSession();
  const t = (await getAdminDictionary()).actions;

  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const technologies = String(formData.get("technologies") ?? "")
    .split(",")
    .map((technology) => technology.trim())
    .filter(Boolean);
  const position = parsePosition(formData.get("position"));

  if (!company || !role || !description) {
    return {
      status: "error",
      message: t.experienceRequired,
    };
  }

  const period = parsePeriod(formData, t);

  if (!period.ok) {
    return { status: "error", message: period.message };
  }

  const data = {
    company,
    role,
    roleEn: englishText(formData, "roleEn"),
    location,
    locationEn: englishText(formData, "locationEn"),
    startedAt: period.startedAt,
    endedAt: period.endedAt,
    description,
    descriptionEn: englishText(formData, "descriptionEn"),
    technologies,
    position,
  };

  const saved =
    id === null
      ? await prisma.experience.create({ data })
      : await prisma.experience.update({ where: { id }, data }).catch(alreadyGone);

  if (!saved) return { status: "error", message: t.gone };

  revalidateSite();

  return {
    status: "ok",
    message:
      id === null ? fill(t.experienceAdded, { role, company }) : fill(t.updated, { name: role }),
  };
}

export async function createExperience(_previous: FormState, formData: FormData) {
  return saveExperience(formData, null);
}

export async function updateExperience(_previous: FormState, formData: FormData) {
  return saveExperience(formData, String(formData.get("id") ?? ""));
}

export async function deleteExperience(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.experience.deleteMany({ where: { id } });

  revalidateSite();
}

async function saveEducation(formData: FormData, id: string | null): Promise<FormState> {
  await requireSession();
  const t = (await getAdminDictionary()).actions;

  const institution = String(formData.get("institution") ?? "").trim();
  const degree = String(formData.get("degree") ?? "").trim();
  const position = parsePosition(formData.get("position"));

  if (!institution || !degree) {
    return {
      status: "error",
      message: t.educationRequired,
    };
  }

  const period = parsePeriod(formData, t);

  if (!period.ok) {
    return { status: "error", message: period.message };
  }

  const data = {
    institution,
    degree,
    degreeEn: englishText(formData, "degreeEn"),
    startedAt: period.startedAt,
    endedAt: period.endedAt,
    position,
  };

  const saved =
    id === null
      ? await prisma.education.create({ data })
      : await prisma.education.update({ where: { id }, data }).catch(alreadyGone);

  if (!saved) return { status: "error", message: t.gone };

  revalidateSite();

  return { status: "ok", message: fill(id === null ? t.added : t.updated, { name: degree }) };
}

export async function createEducation(_previous: FormState, formData: FormData) {
  return saveEducation(formData, null);
}

export async function updateEducation(_previous: FormState, formData: FormData) {
  return saveEducation(formData, String(formData.get("id") ?? ""));
}

export async function deleteEducation(formData: FormData) {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.education.deleteMany({ where: { id } });

  revalidateSite();
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });

  redirect("/login");
}
