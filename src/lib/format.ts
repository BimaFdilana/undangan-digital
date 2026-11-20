const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-12-19" -> { hari: "Sabtu", tgl: 19, bulan: "Desember", tahun: 2026 } (tanpa efek zona waktu) */
export function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return { hari: HARI[dt.getUTCDay()], tgl: d, bulan: BULAN[m - 1], tahun: y, m, y, d };
}

export function dateLong(iso: string) {
  const p = parseDate(iso);
  return `${p.hari}, ${p.tgl} ${p.bulan} ${p.tahun}`;
}

export function dateNoDay(iso: string) {
  const p = parseDate(iso);
  return `${p.tgl} ${p.bulan} ${p.tahun}`;
}

export function dateDots(iso: string) {
  const p = parseDate(iso);
  return `${String(p.tgl).padStart(2, "0")} · ${String(p.m).padStart(2, "0")} · ${p.y}`;
}

export function groupNumber(n: string) {
  return n.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** "1 bulan, 2 minggu yang lalu" / "3 jam yang lalu" / "baru saja" */
export function timeAgo(date: Date, now: Date = new Date()) {
  const sec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (sec < 60) return "baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit yang lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam yang lalu`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days} hari yang lalu`;
  if (days < 30) {
    const w = Math.floor(days / 7), d = days % 7;
    return `${w} minggu${d ? `, ${d} hari` : ""} yang lalu`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30), w = Math.floor((days % 30) / 7);
    return `${m} bulan${w ? `, ${w} minggu` : ""} yang lalu`;
  }
  const y = Math.floor(days / 365), m = Math.floor((days % 365) / 30);
  return `${y} tahun${m ? `, ${m} bulan` : ""} yang lalu`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const AVATAR = ["#e8b3c3", "#cfb1dc", "#fecdb9", "#bfdcc9", "#b8d0e8", "#ead59a"];
export function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR[h % AVATAR.length];
}
