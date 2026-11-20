import "server-only";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { guests, invitations, users, wishes } from "@/db/schema";
import type { SessionUser } from "./auth";

/*
 * Lapisan akses data (DAL). SEMUA pembacaan/penulisan data undangan oleh pengguna
 * login harus lewat sini, supaya pemilik hanya bisa menyentuh undangan miliknya.
 * Admin boleh semuanya; pemilik dibatasi ownerId = id-nya.
 */

function ownerScope(user: SessionUser): SQL | undefined {
  return user.role === "admin" ? undefined : eq(invitations.ownerId, user.id);
}

export async function listInvitations(user: SessionUser) {
  return db
    .select({
      id: invitations.id,
      slug: invitations.slug,
      title: invitations.title,
      theme: invitations.theme,
      status: invitations.status,
      ownerName: users.name,
      guestCount: sql<number>`(select count(*)::int from ${guests} where ${guests.invitationId} = ${invitations.id})`,
      hadirCount: sql<number>`(select count(*)::int from ${guests} where ${guests.invitationId} = ${invitations.id} and ${guests.rsvp} = 'hadir')`,
      openedCount: sql<number>`(select count(*)::int from ${guests} where ${guests.invitationId} = ${invitations.id} and ${guests.openedAt} is not null)`,
    })
    .from(invitations)
    .innerJoin(users, eq(users.id, invitations.ownerId))
    .where(ownerScope(user))
    .orderBy(desc(invitations.createdAt));
}

/** Ambil undangan milik pengguna; 404 bila bukan miliknya (tidak membocorkan keberadaannya). */
export async function getInvitation(user: SessionUser, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [inv] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, id), ownerScope(user)))
    .limit(1);
  if (!inv) notFound();
  return inv;
}

export async function getGuests(user: SessionUser, invitationId: string) {
  const inv = await getInvitation(user, invitationId);
  return db.select().from(guests).where(eq(guests.invitationId, inv.id)).orderBy(asc(guests.name));
}

export async function getWishes(user: SessionUser, invitationId: string) {
  const inv = await getInvitation(user, invitationId);
  return db.select().from(wishes).where(eq(wishes.invitationId, inv.id)).orderBy(desc(wishes.createdAt));
}

export async function listOwners() {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.role, "owner"))
    .orderBy(asc(users.name));
}
