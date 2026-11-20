"use client";

import { useActionState, useState } from "react";
import { createInvitation, type FormState } from "@/app/actions/invitation";
import { THEME_OPTIONS } from "@/lib/themes-list";

const inp = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700";

export function NewForm({ owners }: { owners: { id: string; name: string; email: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createInvitation, {});
  const [mode, setMode] = useState<"existing" | "new">(owners.length ? "existing" : "new");
  return (
    <form action={action} className="max-w-xl space-y-5 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
      <label className="block">
        <span className="mb-1 block text-xs text-stone-500">Judul (mis. Ariani & Syahir)</span>
        <input name="title" required className={inp} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-stone-500">Slug link (kosongkan untuk otomatis dari judul)</span>
        <input name="slug" className={inp} placeholder="ariani-syahir" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-stone-500">Tema</span>
        <select name="theme" className={inp}>
          {THEME_OPTIONS.map((t) => <option key={t.key} value={t.key}>{t.label} — {t.note}</option>)}
        </select>
      </label>

      <fieldset className="space-y-3 rounded-xl bg-stone-50 p-4">
        <legend className="px-1 text-sm font-medium">Pemilik undangan</legend>
        <div className="flex gap-4 text-sm">
          <label><input type="radio" name="ownerMode" value="existing" checked={mode === "existing"} onChange={() => setMode("existing")} disabled={owners.length === 0} /> Akun yang sudah ada</label>
          <label><input type="radio" name="ownerMode" value="new" checked={mode === "new"} onChange={() => setMode("new")} /> Buat akun baru</label>
        </div>
        {mode === "existing" ? (
          <select name="ownerId" className={inp}>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.name} — {o.email}</option>)}
          </select>
        ) : (
          <div className="grid gap-3">
            <input name="ownerName" placeholder="Nama pemilik" className={inp} />
            <input name="ownerEmail" type="email" placeholder="Email (untuk login)" className={inp} />
            <input name="ownerPassword" type="password" placeholder="Kata sandi (min 8 karakter)" autoComplete="new-password" className={inp} />
          </div>
        )}
      </fieldset>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="rounded-lg bg-emerald-800 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-60">
        {pending ? "Membuat…" : "Buat undangan"}
      </button>
    </form>
  );
}
