// Daftar tema untuk pilihan di dashboard (tanpa mengimpor komponen tema).
export const THEME_OPTIONS = [
  { key: "adat", label: "Adat Plum & Emas", note: "Pembuka amplop, video cover, motif songket" },
  { key: "pastel", label: "Pastel Kaligrafi", note: "Gerbang dua panel, nama kaligrafi besar, biru kelabu lembut" },
  { key: "geometris", label: "Hijau Geometris", note: "Pembuka pintu lengkung, bingkai geometris islami" },
] as const;
export type ThemeKey = (typeof THEME_OPTIONS)[number]["key"];
export const THEME_KEYS = THEME_OPTIONS.map((t) => t.key) as unknown as [ThemeKey, ...ThemeKey[]];
