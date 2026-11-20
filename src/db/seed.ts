/**
 * Data contoh untuk pengembangan lokal. Jalankan: pnpm db:seed
 * Aman dijalankan berulang (data lama dengan slug/email sama dilewati).
 *
 * Akun uji lokal (JANGAN dipakai di produksi):
 *   admin   admin@undangan.test     / admin-lokal-123
 *   pemilik fiza@undangan.test      / fiza-lokal-123    -> undangan "fiza-ryan"
 *   pemilik ariani@undangan.test    / ariani-lokal-123  -> undangan "ariani-syahir"
 */
import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { newToken } from "../lib/guests";
import type { InvitationContent } from "../lib/content";
import * as schema from "./schema";

loadEnvConfig(process.cwd());
const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });
const { users, invitations, guests } = schema;

async function upsertUser(email: string, name: string, password: string, role: "admin" | "owner") {
  const [ex] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (ex) return ex;
  const [u] = await db
    .insert(users)
    .values({ email, name, role, passwordHash: await bcrypt.hash(password, 10) })
    .returning();
  return u;
}

async function addInvitation(
  ownerId: string, slug: string, title: string, theme: string,
  content: InvitationContent, guestNames: [string, string | null][],
) {
  const [ex] = await db.select().from(invitations).where(eq(invitations.slug, slug)).limit(1);
  if (ex) return console.log(`- ${slug}: sudah ada, dilewati`);
  const [inv] = await db
    .insert(invitations)
    .values({ ownerId, slug, title, theme, status: "published", content })
    .returning();
  await db.insert(guests).values(
    guestNames.map(([name, phone]) => ({ invitationId: inv.id, name, phone, token: newToken() })),
  );
  console.log(`- ${slug}: dibuat dengan ${guestNames.length} tamu`);
}

const fiza = "/demo/fiza-ryan";
const fizaContent: InvitationContent = {
  bride: { nick: "Fiza", full: "Norhafiza, A.Md,A.B", parents: "Putri ke-3 dari|Bapak Karman & Ibu Juriah" },
  groom: {
    nick: "Ryan", full: "Hadryan Dwi Artha, A.Md,A.B",
    parents: "Putra ke-2 dari|Bapak Erry Ibrahim, S.Sos., M.H (Alm)|& Ibu Eni Susanti",
  },
  nameOrder: "bride",
  countdownTo: "2026-12-19T14:00:00+07:00",
  events: [
    { key: "akad", title: "Akad Nikah", date: "2026-12-19", time: "14.00 WIB – selesai",
      place: "Kediaman Mempelai Wanita", address: "Jalan Antara, Desa Tebun, Kecamatan Rangsang", mapUrl: "" },
    { key: "resepsi", title: "Resepsi", date: "2026-12-20", time: "10.00 WIB – selesai",
      place: "Kediaman Mempelai Wanita", address: "Jalan Antara, Desa Tebun, Kecamatan Rangsang", mapUrl: "" },
  ],
  verse: {
    arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً",
    translation: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum : 21",
  },
  story: [
    { title: "Sebuah Perjalanan Pulang", text: "Banyak yang berkata bahwa jatuh cinta adalah hal yang sederhana. Namun, tetap saling memilih di tengah badai, menjaga di saat rapuh, dan bertahan ketika dunia meminta menyerah — itulah cinta yang sesungguhnya." },
    { title: "Tentang Bertahan", text: "Jika perjalanan ini harus diceritakan dari awal, mungkin tak akan selesai dalam sekali ucap. Bagi kami, cinta bukan sekadar tentang pertemuan, melainkan memilih tetap tinggal di saat banyak alasan untuk pergi. Kami hanyalah dua manusia biasa, dengan segala kurang dan rapuhnya, yang terus belajar saling menjaga. Kami percaya takdir mempertemukan bukan hanya untuk singgah, tetapi untuk saling menguatkan." },
    { title: "Ujian & Bukti", text: "Perjalanan ini tidak hanya dipenuhi bahagia, tetapi juga air mata, ragu, dan waktu yang menguji keyakinan. Kami bertahan bukan karena semuanya mudah, melainkan karena doa yang tak pernah putus, hati yang tetap memilih, dan keyakinan bahwa setiap luka akan bermuara pada restu. Hingga akhirnya, dua keluarga dipersatukan dalam harap yang sama." },
    { title: "Takdir & Keyakinan", text: "Kami mengerti, tidak semua berjalan dengan mudah, dan tidak setiap doa dijawab secepat harapan. Namun di setiap jeda, kami belajar percaya pada Sang Maha Cinta — yang selalu tahu ke mana hari harus pulang. Kami meyakini bahwa takdir terbaik selalu menemukan jalannya." },
    { title: "Menuju Hari Itu", text: "Sebentar lagi, kisah ini akan melangkah ke babak baru — saat dua perjalanan menjadi satu tujuan, dan dua hati berjalan bersama dalam naungan cinta-Nya. Doakan kami, agar setiap langkah ke depan selalu dipeluk lembutnya takdir, dikuatkan kasih Sang Maha Cinta, dan diberkahi kebahagiaan yang tak lekang oleh waktu." },
  ],
  gifts: [
    { bank: "BSI", number: "7316828668", holder: "Norhafiza" },
    { bank: "BRI", number: "018901018816538", holder: "Norhafiza" },
  ],
  photos: {
    cover: `${fiza}/poster.jpg`, gate: `${fiza}/BLU02884.jpg`, ayat: `${fiza}/BLU02884.jpg`,
    bride: `${fiza}/BLU03037.jpg`, groom: `${fiza}/BLU03022.jpg`,
    save: `${fiza}/BLU02848.jpg`, closing: `${fiza}/BLU02848.jpg`,
    gallery: ["BLU02918", "BLU02969", "BLU02993", "BLU03002", "BLU02890", "BLU02956"].map((n) => `${fiza}/${n}.jpg`),
  },
  video: `${fiza}/video-ringan.mp4`,
  giftAddress: {
    recipient: "Khaima",
    address: "Jl. Mentangor Jaya, RT 01/RK 02, Desa Olak, Kecamatan Sungai Mandau, Kab. Siak, Riau.",
  },
  music: "/musik/nuca.m4a",
};

const ar = "/demo/ariani-syahir";
const arianiContent: InvitationContent = {
  bride: { nick: "Ariani", full: "Ariani, A.Md.Li", parents: "Putri dari|Bapak Sulianto & Ibu Supriatik" },
  groom: { nick: "Syahir", full: "Muhammad Syahir, A.Md.Tra", parents: "Putra dari|Bapak Rahim & Ibu Julia Wati" },
  nameOrder: "bride",
  countdownTo: "2026-12-25T08:00:00+07:00",
  palette: "senja",
  music: "/musik/penjaga-hati.m4a",
  events: [
    { key: "akad", title: "Akad Nikah", date: "2026-12-25", time: "", place: "", address: "", mapUrl: "" },
    { key: "resepsi", title: "Resepsi", date: "2026-12-27", time: "", place: "", address: "", mapUrl: "" },
  ],
  verse: fizaContent.verse,
  story: [],
  gifts: [
    { bank: "BSI", number: "7216673969", holder: "Ariani" },
    { bank: "Bank Mandiri", number: "1720004042547", holder: "Muhammad Syahir" },
  ],
  photos: {
    cover: `${ar}/p14.jpg`, coverFocus: "96% 35%", gate: `${ar}/p03.jpg`, ayat: `${ar}/p06.jpg`,
    bride: `${ar}/p02.jpg`, groom: `${ar}/p01.jpg`, save: `${ar}/p03.jpg`, closing: `${ar}/p13.jpg`,
    gallery: ["p07", "p05", "p08", "p09", "p10", "p11", "p12", "p03", "p04", "p13", "p01", "p02"].map((n) => `${ar}/${n}.jpg`),
  },
};

async function main() {
  await upsertUser("admin@undangan.test", "Admin", "admin-lokal-123", "admin");
  const o1 = await upsertUser("fiza@undangan.test", "Fiza & Ryan", "fiza-lokal-123", "owner");
  const o2 = await upsertUser("ariani@undangan.test", "Ariani & Syahir", "ariani-lokal-123", "owner");
  await addInvitation(o1.id, "fiza-ryan", "Fiza & Ryan", "adat", fizaContent,
    [["Bapak Budi Santoso", "081234567890"], ["Ibu Siti Aminah", null], ["Keluarga Besar Hasan", null]]);
  await addInvitation(o2.id, "ariani-syahir", "Ariani & Syahir", "geometris", arianiContent,
    [["Bapak Ahmad Fauzi", null], ["Ibu Dewi Lestari", "081298765432"]]);
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
