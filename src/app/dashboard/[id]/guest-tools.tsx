"use client";

import { useActionState, useMemo, useState } from "react";
import { addGuests, type AddGuestsState } from "@/app/actions/guests";
import { parseGuestList } from "@/lib/guests";

export function BulkAddForm({ invitationId }: { invitationId: string }) {
  const action = addGuests.bind(null, invitationId);
  const [state, formAction, pending] = useActionState<AddGuestsState, FormData>(action, {});
  const [text, setText] = useState("");
  const preview = useMemo(() => parseGuestList(text), [text]);

  return (
    <form
      action={(fd) => {
        formAction(fd);
        setText("");
      }}
      className="rounded-2xl bg-white p-5 ring-1 ring-stone-200"
    >
      <h2 className="mb-1 font-medium">Tambah tamu sekaligus</h2>
      <p className="mb-3 text-sm text-stone-500">
        Satu nama per baris. Boleh ditambah nomor WhatsApp dan kelompok, dipisah koma:
        <code className="ml-1 rounded bg-stone-100 px-1">Budi Santoso, 0812xxxx, Kantor</code>. Bisa tempel langsung dari Excel.
      </p>
      <textarea
        name="list"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder={"Bapak Budi Santoso\nIbu Siti Aminah, 081234567890\nKeluarga Besar Hasan, , Keluarga"}
        className="w-full rounded-lg border border-stone-300 p-3 font-mono text-sm outline-none focus:border-emerald-700"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button disabled={pending || preview.guests.length === 0} className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-50">
          {pending ? "Menyimpan…" : `Buat ${preview.guests.length || ""} undangan`}
        </button>
        <span className="text-sm text-stone-500">
          {preview.guests.length > 0 && `${preview.guests.length} nama terbaca`}
          {preview.guests.filter((g) => g.phone).length > 0 && ` · ${preview.guests.filter((g) => g.phone).length} dengan nomor WA`}
        </span>
        {state.ok && <span role="status" className="text-sm text-emerald-700">{state.ok}</span>}
        {state.error && <span role="alert" className="text-sm text-red-700">{state.error}</span>}
      </div>
    </form>
  );
}

export type GuestRowData = {
  id: string;
  name: string;
  groupName: string | null;
  phone: string | null;
  link: string;
  waHref: string;
  openCount: number;
  rsvp: "pending" | "hadir" | "tidak";
  pax: number;
};

const RSVP_LABEL = { pending: "Belum", hadir: "Hadir", tidak: "Tidak hadir" } as const;
const RSVP_CLASS = {
  pending: "bg-stone-100 text-stone-600",
  hadir: "bg-emerald-100 text-emerald-800",
  tidak: "bg-red-100 text-red-800",
} as const;

export function GuestTable({
  rows,
  deleteAction,
}: {
  rows: GuestRowData[];
  deleteAction: (fd: FormData) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const shown = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      window.prompt("Salin manual:", text);
    }
  }

  return (
    <form action={deleteAction} className="rounded-2xl bg-white ring-1 ring-stone-200">
      <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama tamu…"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-700"
        />
        <button
          type="button"
          onClick={() => copy(rows.map((r) => `${r.name}\t${r.link}`).join("\n"), "all")}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50"
        >
          {copied === "all" ? "Tersalin ✓" : "Salin semua (nama + link)"}
        </button>
        <button
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          onClick={(e) => {
            if (!confirm("Hapus tamu yang dicentang? Link mereka akan berhenti berfungsi.")) e.preventDefault();
          }}
        >
          Hapus terpilih
        </button>
      </div>
      {shown.length === 0 ? (
        <p className="p-6 text-sm text-stone-500">Belum ada tamu.</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {shown.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <input type="checkbox" name="id" value={r.id} aria-label={`Pilih ${r.name}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.name}</p>
                <p className="truncate text-xs text-stone-500">
                  {r.groupName && <>{r.groupName} · </>}
                  {r.phone ?? "tanpa nomor WA"} · {r.openCount > 0 ? `dibuka ${r.openCount}×` : "belum dibuka"}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${RSVP_CLASS[r.rsvp]}`}>
                {RSVP_LABEL[r.rsvp]}{r.rsvp === "hadir" && r.pax > 1 ? ` (${r.pax})` : ""}
              </span>
              <button type="button" onClick={() => copy(r.link, r.id)} className="rounded-lg border border-stone-300 px-2.5 py-1 text-xs hover:bg-stone-50">
                {copied === r.id ? "Tersalin ✓" : "Salin link"}
              </button>
              <a href={r.waHref} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs text-white hover:bg-emerald-800">
                WhatsApp
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
