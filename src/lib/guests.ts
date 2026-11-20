import { customAlphabet } from "nanoid";

// Tanpa karakter yang mudah tertukar (0/O, 1/l/I) agar link mudah dibaca.
const alphabet = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
export const newToken = customAlphabet(alphabet, 10);

export type ParsedGuest = { name: string; phone: string | null; groupName: string | null };

/** Normalisasi nomor WA Indonesia ke format 62xxxxxxxxxx; null bila tak valid. */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.startsWith("8")) d = "62" + d;
  return /^62\d{8,13}$/.test(d) ? d : null;
}

/**
 * Baca daftar tamu dari teks tempelan / CSV.
 * Satu tamu per baris. Format yang diterima:
 *   Nama
 *   Nama, 0812xxxx
 *   Nama, 0812xxxx, Kelompok     (pemisah: koma, titik koma, atau tab)
 * Baris kosong dan baris judul ("nama,...") diabaikan.
 */
export function parseGuestList(text: string): { guests: ParsedGuest[]; skipped: number } {
  const out: ParsedGuest[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    const cells = line.split(/[,;\t]/).map((c) => c.trim());
    const name = (cells[0] ?? "").replace(/\s+/g, " ").trim();
    if (!name) continue;
    if (/^(no|nama|name)$/i.test(name) && out.length === 0) continue; // baris judul
    if (name.length > 120) { skipped++; continue; }
    // nama yang sama persis dalam satu tempelan dianggap duplikat
    const key = name.toLowerCase();
    if (seen.has(key)) { skipped++; continue; }
    seen.add(key);
    const phone = cells[1] ? normalizePhone(cells[1]) : null;
    out.push({ name, phone, groupName: cells[2] ? cells[2].slice(0, 60) : null });
  }
  return { guests: out, skipped };
}
