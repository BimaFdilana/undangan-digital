"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { markOpened } from "@/app/actions/public";

type Phase = "closed" | "open" | "leave" | "gone";
type GateInfo = { names: string; dateText: string; guestName: string | null; photo: string };

const FRAME = (
  <div className="o-frame"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
);

function AdatGate({ phase, onOpen, info }: { phase: Phase; onOpen: () => void; info: GateInfo }) {
  const [a, b] = info.names.split(" & ");
  const mono = `${a?.[0] ?? ""}&${b?.[0] ?? ""}`;
  return (
    <div className={`gate ${phase === "open" || phase === "leave" ? "open" : ""} ${phase === "leave" ? "leave" : ""}`}>
      {info.photo && <img className="gbg" src={info.photo} alt="" />}
      <div className="gshade" />
      <div className="o-band" />
      {FRAME}
      <div className="g-top">
        <div className="eyebrow">The Wedding of</div>
        <div className="t">{a} <em>&amp;</em> {b}</div>
      </div>
      <button className="env" type="button" aria-label="Buka undangan" onClick={onOpen}>
        <div className="e-back" />
        <div className="e-letter"><small>UNDANGAN PERNIKAHAN</small><b>{info.names}</b><span>{info.dateText}</span></div>
        <div className="e-front" /><div className="e-side" /><div className="e-side r" /><div className="e-bottom" />
        <div className="e-flap" />
        <div className="e-seal">{mono}</div>
      </button>
      {info.guestName && (
        <div className="g-guest"><small>Kepada Yth. Bapak/Ibu/Saudara/i</small><b>{info.guestName}</b></div>
      )}
      <div className="g-hint">Ketuk amplop untuk membuka</div>
    </div>
  );
}

function GeoGate({ phase, onOpen, info }: { phase: Phase; onOpen: () => void; info: GateInfo }) {
  const [a, b] = info.names.split(" & ");
  return (
    <div className={`gate ${phase === "open" || phase === "leave" ? "open" : ""} ${phase === "leave" ? "leave" : ""}`}>
      <div className="leaf l"><div className="arc" /></div>
      <div className="leaf r"><div className="arc" /></div>
      <div className="gmid">
        <div className="hilal" />
        <div className="eyebrow">The Wedding of</div>
        <div className="gn">{a} <em>&amp;</em> {b}</div>
        <div className="gd">{info.dateText}</div>
        {info.guestName && <div className="gt">Kepada Yth. Bapak/Ibu/Saudara/i<b>{info.guestName}</b></div>}
        <button className="btn solid" type="button" onClick={onOpen}>Buka Undangan</button>
      </div>
    </div>
  );
}

function PastelPanel({ side }: { side: "l" | "r" }) {
  return (
    <div className={`pg-panel ${side}`}>
      <svg viewBox="0 0 215 932" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <path className="pg-fill" d="M0 0H205C215 90 168 150 188 240C204 310 215 380 195 460C176 540 170 640 200 720C214 790 205 860 190 932H0Z" />
        <g className="pg-orn" fill="none" strokeLinecap="round">
          <path d="M40 120c30-40 80-30 78 6s-44 30-40 0 28-18 34 0" />
          <path d="M30 210c36 6 60 36 40 66s-58 8-34-18 40-6 40 14" />
          <path d="M70 420c26-34 76-20 66 20s-50 28-44 2 30-10 30 8" />
          <path d="M24 540c40-10 70 18 56 52s-52 20-34-6 34-6 30 10" />
          <path d="M60 690c28-30 70-14 64 22s-46 24-42-2 26-8 28 8" />
          <path d="M28 820c34-4 64 20 52 50" />
        </g>
      </svg>
    </div>
  );
}

function PastelGate({ phase, onOpen, info }: { phase: Phase; onOpen: () => void; info: GateInfo }) {
  return (
    <div className={`gate pg ${phase === "open" || phase === "leave" ? "open" : ""} ${phase === "leave" ? "leave" : ""}`}>
      <PastelPanel side="l" />
      <PastelPanel side="r" />
      <div className="pg-mid">
        <div className="pg-card">
          <small>Kepada Yth.,</small>
          <b>{info.guestName ?? "Tamu Undangan"}</b>
        </div>
        <button className="pg-open" type="button" onClick={onOpen}>Buka Undangan</button>
      </div>
    </div>
  );
}

const TIMING = {
  adat: { leaveAt: 2600, goneAt: 4200 },
  geometris: { leaveAt: 2300, goneAt: 3200 },
  pastel: { leaveAt: 1800, goneAt: 2800 },
} as const;

export function Shell({
  theme, slug, token, music, gate, children,
}: {
  theme: "adat" | "geometris" | "pastel";
  slug: string;
  token: string | null;
  music?: string;
  gate: GateInfo;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  // kunci scroll selama gerbang masih menutup
  useEffect(() => {
    if (phase === "closed" || phase === "open") {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => { document.documentElement.style.overflow = prev; };
    }
  }, [phase]);

  function open() {
    if (phase !== "closed") return;
    setPhase("open");
    if (token) void markOpened(slug, token);
    // dipanggil dari klik pengguna, sehingga browser mengizinkan audio
    const a = audio.current;
    if (a) {
      a.volume = 0;
      a.play().then(() => {
        setPlaying(true);
        // volume naik perlahan selama 3 detik
        let v = 0;
        const t = setInterval(() => { v = Math.min(1, v + 0.05); a.volume = v; if (v >= 1) clearInterval(t); }, 150);
      }).catch(() => {});
    }
    const t = TIMING[theme];
    setTimeout(() => { setPhase("leave"); window.scrollTo(0, 0); }, t.leaveAt);
    setTimeout(() => setPhase("gone"), t.goneAt);
  }

  const Gate = theme === "adat" ? AdatGate : theme === "pastel" ? PastelGate : GeoGate;
  return (
    <div className="shell" data-phase={phase}>
      {children}
      {music && (
        <>
          <audio ref={audio} src={music} loop preload="metadata" />
          <button
            className="music"
            type="button"
            aria-label={playing ? "Jeda musik" : "Putar musik"}
            style={{ opacity: playing ? 1 : 0.6 }}
            onClick={() => {
              const el = audio.current;
              if (!el) return;
              if (el.paused) el.play().then(() => setPlaying(true)).catch(() => {});
              else { el.pause(); setPlaying(false); }
            }}
          >
            {playing ? "♫" : "♪"}
          </button>
        </>
      )}
      {phase !== "gone" && <Gate phase={phase} onOpen={open} info={gate} />}
    </div>
  );
}
