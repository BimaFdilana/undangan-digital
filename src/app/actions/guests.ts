"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getInvitation } from "@/lib/dal";
import { newToken, parseGuestList } from "@/lib/guests";

export type AddGuestsState = { ok?: string; error?: string };

export async function addGuests(
  invitationId: string,
  _: AddGuestsState,
  form: FormData,
): Promise<AddGuestsState> {
  const user = await requireUser();
  const inv = await getInvitation(user, invitationId);

  const text = String(form.get("list") ?? "");
  if (text.length > 200_000) return { error: "Daftar terlalu besar." };
  const { guests: parsed, skipped } = parseGuestList(text);
  if (parsed.length === 0) return { error: "Tidak ada nama yang terbaca. Tulis satu nama per baris." };
  if (parsed.length > 2000) return { error: "Maksimal 2.000 tamu sekali tambah." };

  await db.insert(guests).values(
    parsed.map((g) => ({
      invitationId: inv.id,
      name: g.name,
      phone: g.phone,
      groupName: g.groupName,
      token: newToken(),
    })),
  );
  revalidatePath(`/dashboard/${inv.id}`);
  return { ok: `${parsed.length} tamu ditambahkan${skipped ? `, ${skipped} baris dilewati` : ""}.` };
}

export async function deleteGuests(invitationId: string, form: FormData) {
  const user = await requireUser();
  const inv = await getInvitation(user, invitationId);
  const ids = form.getAll("id").map(String).filter((s) => /^[0-9a-f-]{36}$/i.test(s));
  if (ids.length === 0) return;
  await db.delete(guests).where(and(eq(guests.invitationId, inv.id), inArray(guests.id, ids)));
  revalidatePath(`/dashboard/${inv.id}`);
}
