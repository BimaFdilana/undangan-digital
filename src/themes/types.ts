import type { InvitationContent } from "@/lib/content";

export type ThemeData = {
  slug: string;
  title: string;
  content: InvitationContent;
  /** nama dari ?to= yang tidak cocok dengan daftar tamu (hanya untuk sapaan) */
  visitorName?: string;
  /** null = link umum tanpa nama tamu */
  guest: { name: string; token: string; rsvp: "pending" | "hadir" | "tidak"; pax: number } | null;
  wishes: { id: string; name: string; message: string; createdAt: Date; rsvp: "pending" | "hadir" | "tidak" | null }[];
};

export type SectionName =
  | "cover" | "ayat" | "couple" | "date" | "event" | "story" | "gallery" | "live" | "rsvp" | "footer";
