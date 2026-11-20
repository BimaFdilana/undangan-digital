"use client";

import { useActionState, useState } from "react";
import { updateInvitation, type FormState } from "@/app/actions/invitation";
import type { InvitationContent } from "@/lib/content";
import { THEME_OPTIONS } from "@/lib/themes-list";

const inp = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700";
const card = "rounded-2xl bg-white p-5 ring-1 ring-stone-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-stone-500">{label}</span>
      {children}
    </label>
  );
}

export function EditForm({
  inv,
}: {
  inv: { id: string; title: string; theme: string; status: string; content: InvitationContent };
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateInvitation.bind(null, inv.id), {});
  const c = inv.content;
  const events = [...c.events, ...Array(Math.max(0, 3 - c.events.length)).fill(null)].slice(0, 6);
  const gifts = [...c.gifts, ...Array(Math.max(0, 3 - c.gifts.length)).fill(null)].slice(0, 4);
  const story = [...c.story, ...Array(Math.max(0, 6 - c.story.length)).fill(null)].slice(0, 8);
  const cd = c.countdownTo.slice(0, 16);
  const [fx0, fy0] = (c.photos.coverFocus ?? "50% 35%").split(" ").map((v) => parseFloat(v));
  const [fx, setFx] = useState(Number.isFinite(fx0) ? fx0 : 50);
  const [fy, setFy] = useState(Number.isFinite(fy0) ? fy0 : 35);

  return (
    <form action={action} className="space-y-6">
      <section className={card}>
        <h2 className="mb-3 font-medium">Umum</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Judul undangan"><input name="title" defaultValue={inv.title} required className={inp} /></Field>
          <Field label="Tema">
            <select name="theme" defaultValue={inv.theme} className={inp}>
              {THEME_OPTIONS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={inv.status} className={inp}>
              <option value="draft">Draf (tamu belum bisa membuka)</option>
              <option value="published">Terbit</option>
            </select>
          </Field>
          <Field label="Palet warna (tema Hijau Geometris)">
            <select name="palette" defaultValue={c.palette ?? "hijau"} className={inp}>
              <option value="hijau">Hijau tua &amp; emas</option>
              <option value="senja">Senja — navy, lilac, blush &amp; emas champagne</option>
            </select>
          </Field>
          <Field label="Hashtag pernikahan (opsional)">
            <input name="hashtag" defaultValue={c.hashtag ?? ""} className={inp} placeholder="#ArianiDanSyahir" />
          </Field>
          <Field label="Akun Instagram mempelai (opsional)">
            <input name="instagram" defaultValue={c.instagram ?? ""} className={inp} placeholder="@ariani & @syahir" />
          </Field>
          <Field label="Urutan nama di judul">
            <select name="nameOrder" defaultValue={c.nameOrder} className={inp}>
              <option value="bride">Wanita & Pria</option>
              <option value="groom">Pria & Wanita</option>
            </select>
          </Field>
          <Field label="Hitung mundur ke (WIB)"><input type="datetime-local" name="countdownTo" defaultValue={cd} required className={inp} /></Field>
          <Field label="Link live streaming (opsional)"><input name="livestreamUrl" defaultValue={c.livestreamUrl ?? ""} className={inp} placeholder="https://…" /></Field>
          <div className="sm:col-span-3 rounded-xl bg-stone-50 p-3">
            <p className="mb-2 text-xs text-stone-500">
              Posisi foto sampul. Geser bila wajah mempelai tertutup dekorasi atau terpotong di tepi.
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              <label className="text-xs text-stone-500">Kiri ↔ kanan: {fx}%
                <input type="range" name="focusX" min={0} max={100} value={fx} onChange={(e) => setFx(+e.target.value)} className="w-full" />
              </label>
              <label className="text-xs text-stone-500">Atas ↕ bawah: {fy}%
                <input type="range" name="focusY" min={0} max={100} value={fy} onChange={(e) => setFy(+e.target.value)} className="w-full" />
              </label>
              {c.photos.cover && (
                <div className="h-28 w-16 overflow-hidden rounded-lg ring-1 ring-stone-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.photos.cover} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${fx}% ${fy}%` }} />
                </div>
              )}
            </div>
          </div>
          <div className="sm:col-span-3">
            <Field label="Musik latar (opsional) — berkas audio, bukan link YouTube/Spotify">
              <input name="music" defaultValue={c.music ?? ""} className={inp} placeholder="/musik/lagu-kami.mp3  atau  https://…/lagu.mp3" />
            </Field>
            <p className="mt-1 text-xs text-stone-500">Mulai diputar saat tamu menekan &quot;Buka Undangan&quot;. Tamu bisa menjeda lewat tombol di pojok.</p>
          </div>
        </div>
      </section>

      {(["bride", "groom"] as const).map((k) => (
        <section key={k} className={card}>
          <h2 className="mb-3 font-medium">{k === "bride" ? "Mempelai wanita" : "Mempelai pria"}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama panggilan"><input name={`${k}_nick`} defaultValue={c[k].nick} required className={inp} /></Field>
            <Field label="Nama lengkap (dengan gelar)"><input name={`${k}_full`} defaultValue={c[k].full} required className={inp} /></Field>
            <div className="sm:col-span-2">
              <Field label="Keterangan orang tua (satu baris per baris tampilan)">
                <textarea name={`${k}_parents`} rows={3} defaultValue={c[k].parents.split("|").join("\n")} className={inp} />
              </Field>
            </div>
          </div>
        </section>
      ))}

      <section className={card}>
        <h2 className="mb-1 font-medium">Acara</h2>
        <p className="mb-3 text-xs text-stone-500">Kosongkan jam/lokasi bila belum ada (akan tampil &quot;menyusul&quot;). Baris kosong diabaikan.</p>
        <div className="space-y-4">
          {events.map((e, i) => (
            <div key={i} className="grid gap-3 rounded-xl bg-stone-50 p-3 sm:grid-cols-3">
              <input type="hidden" name={`ev_${i}_key`} defaultValue={e?.key ?? ""} />
              <Field label="Nama acara"><input name={`ev_${i}_title`} defaultValue={e?.title ?? ""} className={inp} placeholder="Akad Nikah" /></Field>
              <Field label="Tanggal"><input type="date" name={`ev_${i}_date`} defaultValue={e?.date ?? ""} className={inp} /></Field>
              <Field label="Jam"><input name={`ev_${i}_time`} defaultValue={e?.time ?? ""} className={inp} placeholder="14.00 WIB – selesai" /></Field>
              <Field label="Tempat"><input name={`ev_${i}_place`} defaultValue={e?.place ?? ""} className={inp} /></Field>
              <Field label="Alamat"><input name={`ev_${i}_address`} defaultValue={e?.address ?? ""} className={inp} /></Field>
              <Field label="Link Google Maps (kosong = otomatis dari alamat)"><input name={`ev_${i}_map`} defaultValue={e?.mapUrl ?? ""} className={inp} placeholder="https://maps.app.goo.gl/…" /></Field>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 font-medium">Amplop digital (rekening)</h2>
        <div className="space-y-3">
          {gifts.map((g, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-3">
              <Field label="Bank"><input name={`gf_${i}_bank`} defaultValue={g?.bank ?? ""} className={inp} /></Field>
              <Field label="Nomor rekening"><input name={`gf_${i}_number`} defaultValue={g?.number ?? ""} className={inp} inputMode="numeric" /></Field>
              <Field label="Atas nama"><input name={`gf_${i}_holder`} defaultValue={g?.holder ?? ""} className={inp} /></Field>
            </div>
          ))}
        </div>
              <div className="mt-5 rounded-xl bg-stone-50 p-3">
          <h3 className="mb-1 text-sm font-medium">Kirim kado (opsional)</h3>
          <p className="mb-3 text-xs text-stone-500">Alamat untuk tamu yang ingin mengirim kado fisik. Kosongkan bila tidak perlu.</p>
          <div className="grid gap-3">
            <Field label="Nama penerima">
              <input name="kado_name" defaultValue={c.giftAddress?.recipient ?? ""} className={inp} />
            </Field>
            <Field label="Alamat lengkap">
              <textarea name="kado_address" rows={3} defaultValue={c.giftAddress?.address ?? ""} className={inp} />
            </Field>
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-1 font-medium">Kisah cinta (opsional)</h2>
        <p className="mb-3 text-xs text-stone-500">Tema yang mendukung akan menampilkannya sebagai timeline.</p>
        <div className="space-y-3">
          {story.map((st, i) => (
            <div key={i} className="grid gap-2">
              <input name={`st_${i}_title`} defaultValue={st?.title ?? ""} className={inp} placeholder={`Judul bab ${i + 1}`} />
              <textarea name={`st_${i}_text`} rows={2} defaultValue={st?.text ?? ""} className={inp} placeholder="Isi cerita" />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur">
        <button disabled={pending} className="rounded-lg bg-emerald-800 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-60">
          {pending ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        {state.ok && <span role="status" className="text-sm text-emerald-700">{state.ok}</span>}
        {state.error && <span role="alert" className="text-sm text-red-700">{state.error}</span>}
      </div>
    </form>
  );
}
