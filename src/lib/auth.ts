import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { readSessionUserId } from "./session";

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

/** Pengguna yang sedang login (dibaca ulang dari DB, jadi perubahan peran langsung berlaku). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const uid = await readSessionUserId();
  if (!uid) return null;
  const [u] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1);
  return u ?? null;
});

export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== "admin") notFound();
  return u;
}
