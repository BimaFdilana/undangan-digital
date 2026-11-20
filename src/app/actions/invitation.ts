"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth";
import { contentSchema, type InvitationContent } from "@/lib/content";
import { getInvitation } from "@/lib/dal";
import { slugify } from "@/lib/slug";
import { THEME_KEYS } from "@/lib/themes-list";

export type FormState = { ok?: string; error?: string };

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const lines = (v: string) => v.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).join("|");

function pct(v: string, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : fallback;
}

/** Musik harus berkas audio (path situs atau https). Link YouTube/Spotify tidak bisa diputar langsung. */
function cleanMusic(v: string): { value?: string; error?: string } {
  if (!v) return {};
  if (/(youtube\.com|youtu\.be|spotify\.com|soundcloud\.com|music\.apple\.com|tiktok\.com)/i.test(v))
    return { error: "Link YouTube/Spotify/SoundCloud tidak bisa diputar langsung. Pakai berkas audio (mp3) atau link langsung ke berkas .mp3." };
  const local = v.startsWith("/") && !v.startsWith("//");
  if (!local) {
    try {
      if (new URL(v).protocol !== "https:") return { error: "Link musik harus diawali https://" };
    } catch {
      return { error: "Link musik tidak valid." };
    }
  }
  if (!/\.(mp3|m4a|aac|ogg|wav)(\?.*)?$/i.test(v)) return { error: "Link musik harus berakhiran .mp3, .m4a, .aac, .ogg, atau .wav" };
  return { value: v.slice(0, 500) };
}

/** "2026-12-19T14:00" -> "2026-12-19T14:00:00+07:00" (WIB) */
function toWib(v: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00+07:00` : v;
}

export async function updateInvitation(id: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const inv = await getInvitation(user, id);

  const events = [];
  for (let i = 0; i < 6; i++) {
    const title = s(fd, `ev_${i}_title`);
    const date = s(fd, `ev_${i}_date`);
    if (!title && !date) continue;
    events.push({
      key: s(fd, `ev_${i}_key`) || `acara-${i + 1}`,
      title, date,
      time: s(fd, `ev_${i}_time`), place: s(fd, `ev_${i}_place`),
      address: s(fd, `ev_${i}_address`), mapUrl: s(fd, `ev_${i}_map`),
    });
  }
  const gifts = [];
  for (let i = 0; i < 4; i++) {
    const bank = s(fd, `gf_${i}_bank`), number = s(fd, `gf_${i}_number`);
    if (!bank && !number) continue;
    gifts.push({ bank, number, holder: s(fd, `gf_${i}_holder`) });
  }
  const story = [];
  for (let i = 0; i < 8; i++) {
    const title = s(fd, `st_${i}_title`), text = s(fd, `st_${i}_text`);
    if (!title && !text) continue;
    story.push({ title, text });
  }

  const music = cleanMusic(s(fd, "music"));
  if (music.error) return { error: music.error };

  const next: InvitationContent = {
    ...inv.content,
    bride: { nick: s(fd, "bride_nick"), full: s(fd, "bride_full"), parents: lines(String(fd.get("bride_parents") ?? "")) },
    groom: { nick: s(fd, "groom_nick"), full: s(fd, "groom_full"), parents: lines(String(fd.get("groom_parents") ?? "")) },
    nameOrder: s(fd, "nameOrder") === "groom" ? "groom" : "bride",
    countdownTo: toWib(s(fd, "countdownTo")),
    events, gifts, story,
    livestreamUrl: s(fd, "livestreamUrl") || undefined,
    giftAddress:
      s(fd, "kado_name") || s(fd, "kado_address")
        ? { recipient: s(fd, "kado_name"), address: s(fd, "kado_address") }
        : undefined,
    hashtag: s(fd, "hashtag").slice(0, 60) || undefined,
    instagram: s(fd, "instagram").slice(0, 80) || undefined,
    music: music.value,
    palette: s(fd, "palette") === "senja" ? "senja" : "hijau",
    photos: {
      ...inv.content.photos,
      coverFocus: `${pct(s(fd, "focusX"), 50)}% ${pct(s(fd, "focusY"), 35)}%`,
    },
  };
  const parsed = contentSchema.safeParse(next);
  if (!parsed.success) {
    return { error: "Data belum lengkap: " + parsed.error.issues.map((i) => i.path.join(".")).slice(0, 4).join(", ") };
  }

  const title = s(fd, "title");
  const theme = s(fd, "theme");
  const status = s(fd, "status");
  if (!title) return { error: "Judul wajib diisi." };
  if (!(THEME_KEYS as readonly string[]).includes(theme)) return { error: "Tema tidak dikenal." };

  await db
    .update(invitations)
    .set({
      title, theme,
      status: status === "published" ? "published" : "draft",
      content: parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(invitations.id, inv.id));
  revalidatePath(`/dashboard/${inv.id}`, "layout");
  revalidatePath(`/i/${inv.slug}`, "layout");
  return { ok: "Tersimpan." };
}

const createSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim(),
  theme: z.enum(THEME_KEYS),
  ownerMode: z.enum(["existing", "new"]),
  ownerId: z.string().optional(),
  ownerName: z.string().trim().optional(),
  ownerEmail: z.string().trim().toLowerCase().optional(),
  ownerPassword: z.string().optional(),
});

export async function createInvitation(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const p = createSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Judul dan tema wajib diisi." };
  const v = p.data;

  const slug = slugify(v.slug || v.title);
  if (slug.length < 3) return { error: "Slug terlalu pendek." };
  if (["admin", "login", "logout", "api", "dashboard", "i", "demo", "themes", "musik", "_next", "favicon", "robots", "sitemap"].includes(slug)) return { error: "Slug itu dicadangkan." };
  const [dup] = await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.slug, slug)).limit(1);
  if (dup) return { error: "Slug sudah dipakai undangan lain." };

  let ownerId = v.ownerId ?? "";
  if (v.ownerMode === "new") {
    if (!v.ownerName || !v.ownerEmail || !z.string().email().safeParse(v.ownerEmail).success)
      return { error: "Nama dan email pemilik wajib diisi dengan benar." };
    if (!v.ownerPassword || v.ownerPassword.length < 8) return { error: "Kata sandi pemilik minimal 8 karakter." };
    const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, v.ownerEmail)).limit(1);
    if (exists) return { error: "Email pemilik sudah terdaftar." };
    const [u] = await db
      .insert(users)
      .values({
        email: v.ownerEmail, name: v.ownerName, role: "owner",
        passwordHash: await bcrypt.hash(v.ownerPassword, 10),
      })
      .returning({ id: users.id });
    ownerId = u.id;
  }
  if (!ownerId) return { error: "Pilih pemilik undangan." };

  const content: InvitationContent = {
    bride: { nick: "Mempelai Wanita", full: "Nama lengkap mempelai wanita", parents: "Putri dari|Bapak … & Ibu …" },
    groom: { nick: "Mempelai Pria", full: "Nama lengkap mempelai pria", parents: "Putra dari|Bapak … & Ibu …" },
    nameOrder: "bride",
    countdownTo: "2027-01-01T08:00:00+07:00",
    events: [
      { key: "akad", title: "Akad Nikah", date: "2027-01-01", time: "", place: "", address: "", mapUrl: "" },
      { key: "resepsi", title: "Resepsi", date: "2027-01-02", time: "", place: "", address: "", mapUrl: "" },
    ],
    verse: {
      arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً",
      translation: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
      source: "QS. Ar-Rum : 21",
    },
    story: [], gifts: [],
    photos: { cover: "", gate: "", ayat: "", bride: "", groom: "", save: "", closing: "", gallery: [] },
  };
  const [inv] = await db
    .insert(invitations)
    .values({ ownerId, slug, title: v.title, theme: v.theme, status: "draft", content })
    .returning({ id: invitations.id });
  redirect(`/dashboard/${inv.id}/edit`);
}
