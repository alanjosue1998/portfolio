"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type ProjectState = { status: "error" | "ok"; message: string } | undefined;

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

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });

  redirect("/login");
}
