"use client";

import { useEffect, useState, useTransition } from "react";
import { submitRsvp, type RsvpState } from "@/app/actions/public";

export function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, []);
  const target = new Date(to).getTime();
  const diff = now === null ? 0 : Math.max(0, target - now);
  const p = (n: number) => String(n).padStart(2, "0");
  const d = Math.floor(diff / 86_400_000);
  const parts: [string, string][] = [
    [String(d).padStart(2, "0"), "Hari"],
    [p(Math.floor(diff / 3_600_000) % 24), "Jam"],
    [p(Math.floor(diff / 60_000) % 60), "Menit"],
    [p(Math.floor(diff / 1000) % 60), "Detik"],
  ];
  return (
    <div className="cd" aria-label="Hitung mundur menuju acara">
      {parts.map(([v, l]) => (
        <div key={l}>
          <b suppressHydrationWarning>{v}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

export function CopyButton({ text, label = "Salin Nomor" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          window.prompt("Salin manual:", text);
        }
      }}
    >
      {done ? "Tersalin ✓" : label}
    </button>
  );
}

export function RsvpBlock({
  slug,
  guest,
  defaultName,
  mode = "full",
}: {
  slug: string;
  defaultName?: string;
  /** full = kehadiran + ucapan; rsvp = hanya kehadiran; wish = hanya ucapan */
  mode?: "full" | "rsvp" | "wish";
  guest: { name: string; token: string; rsvp: "pending" | "hadir" | "tidak"; pax: number } | null;
}) {
  const [state, setState] = useState<RsvpState>({});
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [rsvp, setRsvp] = useState<"" | "hadir" | "tidak">(guest && guest.rsvp !== "pending" ? guest.rsvp : "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await submitRsvp(slug, guest?.token ?? null, {}, fd);
      setState(r);
      if (r.ok) setMsg(""); // ucapan terkirim: kosongkan kolom
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="rsvp-name">Nama</label>
        {guest ? <div id="rsvp-name">{guest.name}</div> : <input id="rsvp-name" name="name" required maxLength={80} defaultValue={defaultName ?? ""} />}
      </div>
      {guest && mode !== "wish" && (
        <>
          <input type="hidden" name="rsvp" value={rsvp} />
          <div className="choice" role="group" aria-label="Konfirmasi kehadiran">
            <button type="button" className={`btn ${rsvp === "hadir" ? "solid" : ""}`} onClick={() => setRsvp("hadir")}>Hadir</button>
            <button type="button" className={`btn ${rsvp === "tidak" ? "solid" : ""}`} onClick={() => setRsvp("tidak")}>Tidak Hadir</button>
          </div>
          {rsvp === "hadir" && (
            <div className="field">
              <label htmlFor="rsvp-pax">Jumlah yang hadir</label>
              <select id="rsvp-pax" name="pax" defaultValue={guest.pax > 0 ? guest.pax : 1}>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} orang</option>)}
              </select>
            </div>
          )}
        </>
      )}
      {mode !== "rsvp" && (
      <div className="field">
          <label htmlFor="rsvp-msg">Ucapan &amp; Doa</label>
          <textarea
            id="rsvp-msg" name="message" maxLength={1000} placeholder="Tulis ucapan dan doa…"
            value={msg} onChange={(e) => setMsg(e.target.value)}
          />
          <div className="rsvp-count">{msg.length}/1000</div>
        </div>
      )}
      <button className="btn solid" disabled={pending || (mode === "rsvp" && !rsvp)}>{pending ? "Mengirim…" : mode === "rsvp" ? "Konfirmasi" : "Kirim"}</button>
      {state.ok && <p className="rsvp-msg" role="status">{state.ok}</p>}
      {state.error && <p className="rsvp-msg" role="alert" style={{ color: "#f0a090" }}>{state.error}</p>}
    </form>
  );
}
