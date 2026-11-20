import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { guests, invitations, wishes } from "@/db/schema";
import { getCurrentUser } from "./auth";

/** Undangan untuk dilihat publik. Draf hanya bisa dilihat admin/pemiliknya (pratinjau). */
export const getInvitationForView = cache(async (slug: string) => {
  const [inv] = await db.select().from(invitations).where(eq(invitations.slug, slug)).limit(1);
  if (!inv) return null;
  if (inv.status !== "published") {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.id !== inv.ownerId)) return null;
  }
  return inv;
});

export const getGuestByToken = cache(async (invitationId: string, token: string) => {
  if (!/^[A-Za-z0-9]{6,32}$/.test(token)) return null;
  const [g] = await db
    .select()
    .from(guests)
    .where(and(eq(guests.invitationId, invitationId), eq(guests.token, token)))
    .limit(1);
  return g ?? null;
});

export async function getRecentWishes(invitationId: string, limit = 50) {
  return db
    .select({
      id: wishes.id,
      name: wishes.name,
      message: wishes.message,
      createdAt: wishes.createdAt,
      rsvp: guests.rsvp, // null bila ucapan dikirim dari link umum (tanpa tamu)
    })
    .from(wishes)
    .leftJoin(guests, eq(guests.id, wishes.guestId))
    .where(eq(wishes.invitationId, invitationId))
    .orderBy(desc(wishes.createdAt))
    .limit(limit);
}

/**
 * Rapikan nama dari ?to= : spasi tunggal, tanpa karakter kontrol, maksimal 80 huruf.
 * Bentuk "keluarga-besar-eltrofiq" (huruf kecil, pakai tanda hubung, tanpa spasi) dibaca sebagai
 * "Keluarga Besar Eltrofiq".
 */
export function cleanVisitorName(raw: string | string[] | undefined): string | null {
  const v = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const name = v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return name || null;
}

/** Bentuk slug (mis. "keluarga-besar-eltrofiq") -> "Keluarga Besar Eltrofiq"; selain itu dikembalikan apa adanya. */
export function displayVisitorName(name: string) {
  if (/\s/.test(name) || !name.includes("-") || name !== name.toLowerCase()) return name;
  return name.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Cari tamu dari nama (tanpa membedakan huruf besar/kecil; "bapak-budi" cocok dengan "Bapak Budi").
 * Bila ada lebih dari satu tamu bernama sama, hasilnya null (ambigu) agar tidak salah orang.
 */
export async function getGuestByName(invitationId: string, name: string) {
  const find = async (n: string) =>
    db
      .select()
      .from(guests)
      .where(and(eq(guests.invitationId, invitationId), sql`lower(${guests.name}) = ${n.toLowerCase()}`))
      .limit(2);
  let rows = await find(name);
  if (rows.length === 0 && name.includes("-")) rows = await find(name.replace(/-+/g, " ").trim());
  return rows.length === 1 ? rows[0] : null;
}
