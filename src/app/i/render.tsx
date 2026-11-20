import { notFound } from "next/navigation";
import {
  cleanVisitorName, displayVisitorName, getGuestByName, getGuestByToken, getInvitationForView, getRecentWishes,
} from "@/lib/public";
import { renderTheme } from "@/themes/registry";

/**
 * Cara tamu dikenali:
 *  1. token di alamat (/i/slug/token)         -> pasti tamu itu
 *  2. ?to=Nama+Tamu                           -> dicocokkan ke daftar tamu berdasarkan nama;
 *                                                bila tidak ada yang cocok, nama tetap ditampilkan
 *  3. tanpa keduanya                          -> undangan umum
 */
export async function InvitationView({
  slug, token, to,
}: {
  slug: string;
  token: string | null;
  to?: string | string[];
}) {
  const inv = await getInvitationForView(slug);
  if (!inv) notFound();

  let g = null;
  let visitorName: string | undefined;
  if (token) {
    g = await getGuestByToken(inv.id, token);
    if (!g) notFound();
  } else {
    const name = cleanVisitorName(to);
    if (name) {
      g = await getGuestByName(inv.id, name);
      if (!g) visitorName = displayVisitorName(name);
    }
  }

  const guest = g ? { name: g.name, token: g.token, rsvp: g.rsvp, pax: g.pax } : null;
  const wishes = await getRecentWishes(inv.id);
  return renderTheme(inv.theme, { slug: inv.slug, title: inv.title, content: inv.content, guest, visitorName, wishes });
}
