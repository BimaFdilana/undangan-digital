"use server";

import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { guests, invitations, wishes } from "@/db/schema";
import { rateLimit } from "@/lib/ratelimit";

async function ip() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

const TOKEN = /^[A-Za-z0-9]{6,32}$/;

/** Dipanggil saat tamu menekan "Buka Undangan" (bukan saat halaman dimuat, agar bot tidak terhitung). */
export async function markOpened(slug: string, token: string) {
  if (!TOKEN.test(token) || !rateLimit(`open:${await ip()}`, 60, 60_000)) return;
  const [inv] = await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.slug, slug)).limit(1);
  if (!inv) return;
  await db
    .update(guests)
    .set({ openCount: sql`${guests.openCount} + 1`, openedAt: sql`coalesce(${guests.openedAt}, now())` })
    .where(and(eq(guests.invitationId, inv.id), eq(guests.token, token)));
}

export type RsvpState = { ok?: string; error?: string };

export async function submitRsvp(
  slug: string,
  token: string | null,
  _: RsvpState,
  fd: FormData,
): Promise<RsvpState> {
  if (!rateLimit(`rsvp:${await ip()}`, 12, 10 * 60_000)) return { error: "Terlalu banyak kiriman. Coba lagi nanti." };
  const [inv] = await db
    .select({ id: invitations.id, status: invitations.status })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .limit(1);
  if (!inv || inv.status !== "published") return { error: "Undangan tidak ditemukan." };

  const message = String(fd.get("message") ?? "").trim().slice(0, 1000);
  let name = String(fd.get("name") ?? "").trim().slice(0, 80);
  let guestId: string | null = null;

  if (token) {
    if (!TOKEN.test(token)) return { error: "Link tidak valid." };
    const [g] = await db
      .select()
      .from(guests)
      .where(and(eq(guests.invitationId, inv.id), eq(guests.token, token)))
      .limit(1);
    if (!g) return { error: "Link tidak valid." };
    guestId = g.id;
    name = g.name;
    const rsvp = String(fd.get("rsvp") ?? "");
    if (rsvp === "hadir" || rsvp === "tidak") {
      const pax = Math.min(10, Math.max(1, Number(fd.get("pax")) || 1));
      await db
        .update(guests)
        .set({ rsvp, pax: rsvp === "hadir" ? pax : 0, rsvpAt: new Date() })
        .where(eq(guests.id, g.id));
    } else if (!message) {
      return { error: "Pilih hadir/tidak hadir atau tulis ucapan." };
    }
  } else if (!name || !message) {
    return { error: "Nama dan ucapan wajib diisi." };
  }

  if (message) await db.insert(wishes).values({ invitationId: inv.id, guestId, name, message });
  revalidatePath(`/i/${slug}`, "layout");
  return { ok: "Terima kasih, konfirmasi dan doa Anda sudah kami terima." };
}
