import { z } from "zod";

// Isi undangan disimpan sebagai JSON di kolom invitations.content.
// Tema hanya membaca data ini, jadi tema bisa diganti tanpa menyentuh isi.

const person = z.object({
  nick: z.string().min(1),
  full: z.string().min(1),
  // contoh: "Putri ke-3 dari|Bapak Karman & Ibu Juriah" ("|" = baris baru)
  parents: z.string().default(""),
});

const eventItem = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1), // YYYY-MM-DD
  time: z.string().default(""), // contoh "14.00 WIB – selesai"; kosong = menyusul
  place: z.string().default(""),
  address: z.string().default(""),
  mapUrl: z.string().default(""),
});

export const contentSchema = z.object({
  bride: person,
  groom: person,
  // urutan nama di judul: "bride" -> "Fiza & Ryan", "groom" -> "Ryan & Fiza"
  nameOrder: z.enum(["bride", "groom"]).default("bride"),
  // waktu hitung mundur (ISO, mis. 2026-12-19T14:00:00+07:00)
  countdownTo: z.string().min(1),
  events: z.array(eventItem).default([]),
  verse: z
    .object({
      arabic: z.string().default(""),
      translation: z.string().default(""),
      source: z.string().default(""),
    })
    .optional(),
  // alamat pengiriman kado fisik (opsional), tampil di halaman Amplop Digital
  giftAddress: z.object({ recipient: z.string().default(""), address: z.string().default("") }).optional(),
  story: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
  gifts: z
    .array(z.object({ bank: z.string(), number: z.string(), holder: z.string() }))
    .default([]),
  photos: z.object({
    cover: z.string().default(""),
    // titik fokus foto sampul, mis. "95% 35%" (x y). Geser agar wajah tidak tertutup dekorasi/terpotong.
    coverFocus: z
      .string()
      .regex(/^(\d{1,3}(\.\d+)?%|left|center|right)\s+(\d{1,3}(\.\d+)?%|top|center|bottom)$/)
      .optional(),
    gate: z.string().default(""),
    ayat: z.string().default(""),
    bride: z.string().default(""),
    groom: z.string().default(""),
    save: z.string().default(""),
    closing: z.string().default(""),
    gallery: z.array(z.string()).default([]),
  }),
  // palet warna tema geometris: "hijau" (bawaan) atau "senja" (navy + lilac)
  palette: z.enum(["hijau", "senja"]).optional(),
  // ajakan bagikan ke Instagram (opsional): hashtag dan akun mempelai
  hashtag: z.string().optional(),
  instagram: z.string().optional(),
  video: z.string().optional(),
  music: z.string().optional(),
  livestreamUrl: z.string().optional(),
  closingNote: z.string().optional(),
});

export type InvitationContent = z.infer<typeof contentSchema>;
