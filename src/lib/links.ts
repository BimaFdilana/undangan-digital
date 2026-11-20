import type { Guest } from "@/db/schema";

export function baseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Link tamu. Nama unik -> https://situs/slug?to=nama-tamu ; nama kembar -> link berkode (agar tidak salah orang). */
export function guestLink(slug: string, token: string, name?: string, duplicate = false) {
  if (!name || duplicate) return `${baseUrl()}/i/${slug}/${token}`;
  // nama sederhana -> gaya slug (keluarga-besar-eltrofiq); nama dengan tanda baca -> +-encoding
  const q = /^[A-Za-z0-9 ]+$/.test(name)
    ? name.trim().toLowerCase().replace(/\s+/g, "-")
    : encodeURIComponent(name).replace(/%20/g, "+");
  return `${baseUrl()}/${slug}?to=${q}`;
}

export function waMessage(opts: { title: string; dateText: string; name: string; link: string }) {
  return [
    "Assalamu'alaikum Wr. Wb.",
    "",
    `Kepada Yth. ${opts.name}`,
    "",
    `Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan ${opts.title}${opts.dateText ? ` pada ${opts.dateText}` : ""}.`,
    "",
    "Berikut link undangan digital kami:",
    opts.link,
    "",
    "Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Terima kasih.",
  ].join("\n");
}

export function waUrl(phone: Guest["phone"], text: string) {
  return `https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`;
}

/** Link Google Maps resmi (pencarian) dari teks alamat, dipakai bila pemilik belum menempel link pin. */
export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Link "Tambah ke Kalender" (Google Calendar). Jam tidak ada -> acara seharian. */
export function googleCalendarUrl(o: { title: string; date: string; time: string; location: string; details?: string }) {
  const [y, mo, d] = o.date.split("-").map(Number);
  const day = `${y}${String(mo).padStart(2, "0")}${String(d).padStart(2, "0")}`;
  const t = o.time.match(/(\d{1,2})[.:](\d{2})/);
  let dates: string;
  if (t) {
    const h = Number(t[1]);
    dates = `${day}T${String(h).padStart(2, "0")}${t[2]}00/${day}T${String((h + 2) % 24).padStart(2, "0")}${t[2]}00`;
  } else {
    const next = new Date(Date.UTC(y, mo - 1, d + 1));
    const nd = `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, "0")}${String(next.getUTCDate()).padStart(2, "0")}`;
    dates = `${day}/${nd}`;
  }
  const q = new URLSearchParams({ action: "TEMPLATE", text: o.title, dates, details: o.details ?? "", location: o.location });
  if (t) q.set("ctz", "Asia/Jakarta");
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
