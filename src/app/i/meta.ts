import type { Metadata } from "next";
import { getInvitationForView } from "@/lib/public";

export async function invitationMetadata(slug: string): Promise<Metadata> {
  const inv = await getInvitationForView(slug);
  if (!inv) return { title: "Undangan" };
  const cover = inv.content.photos.cover || inv.content.photos.gate;
  const title = `Undangan Pernikahan ${inv.title}`;
  const description = "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk hadir di hari bahagia kami.";
  return {
    title,
    description,
    // link berisi nama tamu: jangan diindeks mesin pencari
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", images: cover ? [{ url: cover }] : undefined },
  };
}
