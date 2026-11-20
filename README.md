# Undangan Digital

Aplikasi undangan pernikahan multi-pemilik. Next.js 16 (App Router) + PostgreSQL + Drizzle.

## Menjalankan di komputer lokal

```bash
pnpm install
pnpm db:up          # Postgres di Docker (port 5433)
pnpm db:migrate     # buat tabel
pnpm db:seed        # data contoh: 1 admin, 2 pemilik, 2 undangan
pnpm dev            # http://localhost:3000
```

Salin `.env.example` menjadi `.env.local` bila belum ada, lalu isi `SESSION_SECRET`.

Akun uji lokal ada di komentar atas `src/db/seed.ts` (jangan dipakai di produksi).

## Alur

- **Admin** membuat undangan (`/dashboard/admin/new`) dan menugaskannya ke akun pemilik (akun baru atau yang ada).
- **Pemilik** hanya melihat undangannya sendiri: mengisi data (`Data undangan`), memilih tema,
  menerbitkan, lalu menambah tamu sekaligus (tempel satu nama per baris, boleh dengan nomor WA dan kelompok).
- Tiap tamu mendapat link unik `/i/<slug>/<token>`. Nama tamu diambil dari database, bukan dari URL.
  Link tanpa token (`/i/<slug>`) menampilkan undangan umum.
- Tamu membuka link, menekan "Buka Undangan" (tercatat sebagai sudah dibuka), lalu bisa konfirmasi hadir dan menulis ucapan.

## Struktur

| Lokasi | Isi |
|---|---|
| `src/db/schema.ts` | tabel users, invitations, guests, wishes |
| `src/lib/dal.ts` | semua akses data ber-otorisasi (pemilik dibatasi `owner_id`) |
| `src/lib/auth.ts`, `session.ts` | login (bcrypt + cookie sesi JWT), peran admin/owner |
| `src/app/dashboard/*` | dashboard admin dan pemilik |
| `src/app/i/*` | halaman undangan publik |
| `src/themes/*` | tema (adat, geometris). Menambah tema = satu folder + daftar di `registry.tsx` dan `lib/themes-list.ts` |

## Belum ada (rencana)

- Unggah foto/video dari dashboard (saat ini aset ada di `public/demo/*`).
- Kompres video, `next/image` + `sharp`.
- Deploy ke VPS (Caddy + Docker Compose + backup).

## Video sampul

Video latar dipakai dalam bentuk ringan (540×960, 30 fps, ±0,85 Mbps, tanpa suara) agar lancar di HP.
Video baru dikompres dengan `scripts/compress-video.swift` (lihat petunjuk di dalam berkas). Komponen
`src/themes/loop-video.tsx` mengulang video dengan pudar halus di sambungan, menjeda saat halaman
sampul tidak tampil, dan memulihkan pemutaran bila browser menjedanya.

## Musik latar

Isi kolom **Musik latar** di tab *Data undangan* dengan jalur berkas audio, mis. `/musik/lagu-kami.mp3`
(taruh berkasnya di `public/musik/`), atau link langsung `https://…/lagu.mp3`. Link YouTube/Spotify ditolak
karena tidak bisa diputar sebagai audio latar. Musik mulai saat tamu menekan "Buka Undangan"
(volume naik perlahan) dan tamu bisa menjeda lewat tombol di pojok.
