"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// Cara lembar terangkat; dipakai bergantian supaya tiap halaman terasa berbeda.
const VARIANTS = ["lift", "flip", "swing", "lift", "slide", "flip"] as const;
const LOCK_MS = 950;

export function Book({ children }: { children: ReactNode }) {
  const pages = Children.toArray(children);
  const total = pages.length;
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const locked = useRef(false);
  const idx = useRef(0);

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(total - 1, to));
      if (next === idx.current || locked.current) return;
      locked.current = true;
      // lepas fokus dari lembar yang akan pergi; browser bisa menggulirkan wadah demi elemen terfokus
      (document.activeElement as HTMLElement | null)?.blur?.();
      idx.current = next;
      setIndex(next);
      const el = refs.current[next];
      if (el) el.scrollTop = 0;
      setTimeout(() => { locked.current = false; }, LOCK_MS);
    },
    [total],
  );

  useEffect(() => {
    const box = root.current;
    if (!box) return;
    const edges = () => {
      const el = refs.current[idx.current];
      if (!el) return { down: false, up: false };
      return {
        down: el.scrollTop + el.clientHeight < el.scrollHeight - 3,
        up: el.scrollTop > 3,
      };
    };

    // Apakah ada wadah yang bisa digulir (daftar ucapan, atau lembar itu sendiri) dari elemen ini ke atas
    // yang masih bisa bergerak ke arah dir? Jika ya, jangan ganti halaman; biarkan gulir bawaan.
    const canScroll = (from: EventTarget | null, dir: number) => {
      let el = from as HTMLElement | null;
      while (el && el !== box) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          const room = dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 3 : el.scrollTop > 3;
          if (room) return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    // Satu gerakan roda/trackpad = satu halaman. Ekor inersia trackpad (event yang terus datang
    // dengan jeda singkat) tidak boleh memicu halaman kedua.
    let lastWheel = 0, lastNative = 0, acc = 0, turned = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const dir = Math.sign(e.deltaY);
      if (canScroll(e.target, dir)) { lastNative = performance.now(); return; } // biarkan gulir di dalam lembar / daftar
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 140) { acc = 0; turned = false; } // gerakan baru
      lastWheel = now;
      // baru sampai ujung lewat gerakan yang sama (mis. inersia trackpad): jangan langsung ganti halaman
      if (now - lastNative < 450) { lastNative = now; return; }
      if (turned) return;
      acc += e.deltaY;
      if (Math.abs(acc) >= 30) { turned = true; go(idx.current + Math.sign(acc)); }
    };

    let startY = 0, startX = 0, startDown = false, startUp = false;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startDown = canScroll(e.target, 1);
      startUp = canScroll(e.target, -1);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dy) < 55 || Math.abs(dy) < Math.abs(dx)) return;
      if (dy > 0 && !startDown) go(idx.current + 1);
      else if (dy < 0 && !startUp) go(idx.current - 1);
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (["ArrowDown", "PageDown", "ArrowRight", " "].includes(e.key)) {
        if (edges().down) return;
        e.preventDefault(); go(idx.current + 1);
      } else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(e.key)) {
        if (edges().up) return;
        e.preventDefault(); go(idx.current - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
    };

    // tombol dengan data-next (mis. "Lihat Undangan") membuka lembar berikutnya; data-goto melompat ke lembar tertentu
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-next]")) { e.preventDefault(); go(idx.current + 1); return; }
      // data-goto="nama-kelas": loncat ke lembar yang memuat bagian berkelas itu
      const g = t.closest<HTMLElement>("[data-goto]");
      if (g) {
        e.preventDefault();
        const cls = g.dataset.goto ?? "";
        const to = refs.current.findIndex((el) => !!el?.querySelector(`.${CSS.escape(cls)}`));
        if (to >= 0) go(to);
      }
    };

    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("touchstart", onTouchStart, { passive: true });
    box.addEventListener("touchend", onTouchEnd, { passive: true });
    box.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("touchstart", onTouchStart);
      box.removeEventListener("touchend", onTouchEnd);
      box.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [go, total]);

  return (
    <div className="book" ref={root}>
      {pages.map((p, i) => {
        const state = i < index ? "before" : i === index ? "current" : "after";
        const near = Math.abs(i - index) <= 1;
        return (
          <div
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="sheet"
            data-s={state}
            data-v={VARIANTS[i % VARIANTS.length]}
            data-near={near ? "1" : "0"}
            style={{ zIndex: total - i }}
            aria-hidden={state !== "current"}
            inert={state !== "current"}
          >
            {p}
          </div>
        );
      })}

      <nav className="book-dots" aria-label="Halaman undangan">
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Halaman ${i + 1}`}
            aria-current={i === index}
            className={i === index ? "on" : ""}
            onClick={() => go(i)}
          />
        ))}
      </nav>

      {index < total - 1 && (
        <button type="button" className="book-hint" onClick={() => go(index + 1)} aria-label="Halaman berikutnya">
          <span>{index === 0 ? "Geser ke atas" : "Lanjut"}</span>
          <i />
        </button>
      )}
    </div>
  );
}
