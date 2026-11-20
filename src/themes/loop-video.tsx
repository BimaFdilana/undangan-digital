"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Video latar yang berputar terus.
 * - Memudar sebentar tepat sebelum dan sesudah pengulangan, jadi lompatan di sambungan tidak terlihat.
 * - Dijeda saat lembar sampulnya tidak sedang tampil (hemat baterai/CPU), dan dilanjutkan otomatis
 *   saat kembali tampil. Browser kadang menjeda video sendiri; pemeriksaan berkala memulihkannya.
 */
export function LoopVideo({ src, poster, position }: { src: string; poster?: string; position?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const sheetIsCurrent = () => {
      const sheet = v.closest<HTMLElement>(".sheet");
      return !sheet || sheet.dataset.s === "current";
    };
    const sync = () => {
      if (document.hidden) return;
      if (sheetIsCurrent()) {
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    };

    const onTime = () => {
      const left = v.duration - v.currentTime;
      if (!Number.isFinite(left)) return;
      if (left < 0.7) setFade(true);
      else if (v.currentTime > 0.35) setFade(false);
    };
    // jika loop bawaan gagal (mis. jaringan putus), ulang manual
    const onEnded = () => { v.currentTime = 0; v.play().catch(() => {}); };

    const timer = setInterval(sync, 1000);
    document.addEventListener("visibilitychange", sync);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    v.addEventListener("canplay", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("canplay", sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={`bg loop-video${fade ? " fade" : ""}`}
      src={src}
      poster={poster}
      style={position ? { objectPosition: position } : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
    />
  );
}
