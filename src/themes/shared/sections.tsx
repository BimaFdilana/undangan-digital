import type { ReactNode } from "react";
import { avatarColor, dateDots, dateLong, groupNumber, initials, timeAgo } from "@/lib/format";
import { mapsSearchUrl } from "@/lib/links";
import { Book } from "../book";
import { Countdown, CopyButton, RsvpBlock } from "../client";
import { LoopVideo } from "../loop-video";
import type { SectionName, ThemeData } from "../types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export type DecoFn = (s: SectionName) => ReactNode;

function Lines({ text }: { text: string }) {
  const parts = text.split("|").filter(Boolean);
  return (
    <>
      {parts.map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {l}
        </span>
      ))}
    </>
  );
}

export function coupleNames(c: ThemeData["content"]) {
  const [a, b] = c.nameOrder === "groom" ? [c.groom, c.bride] : [c.bride, c.groom];
  return { a: a.nick, b: b.nick };
}

/** Bagi foto galeri jadi kelompok 3 (sisa 1 digabung ke kelompok sebelumnya jadi 4). */
function chunkGallery(list: string[]) {
  const out: string[][] = [];
  for (let i = 0; i < list.length; i += 3) out.push(list.slice(i, i + 3));
  if (out.length > 1 && out[out.length - 1].length === 1) {
    const last = out.pop()!;
    out[out.length - 1].push(...last);
  }
  return out;
}

/**
 * Isi undangan dibagi menjadi "lembar": satu lembar = satu layar.
 * Komponen <Book> mengatur pengangkatan lembar saat digeser.
 */
export function Sections({
  data, deco, geo = false,
}: {
  data: ThemeData;
  deco: DecoFn;
  /** tema geometris menambah bulan sabit di bagian ayat */
  geo?: boolean;
}) {
  const { content: c, guest, slug, wishes } = data;
  const greetName = guest?.name ?? data.visitorName;
  const { a, b } = coupleNames(c);
  const first = c.events[0];
  const people = c.nameOrder === "groom"
    ? ([["groom", c.groom], ["bride", c.bride]] as const)
    : ([["bride", c.bride], ["groom", c.groom]] as const);
  const ph = c.photos;
  const pages: ReactNode[] = [];

  // 1. Sampul
  pages.push(
    <section key="cover" className="cover full">
      {deco("cover")}
      {c.video ? (
        <LoopVideo src={c.video} poster={ph.cover || undefined} position={ph.coverFocus} />
      ) : (
        ph.cover && <img className="bg" src={ph.cover} alt="" style={{ objectPosition: ph.coverFocus ?? "center 35%" }} />
      )}
      <div className="shade" />
      <div className="brand">THE WEDDING OF</div>
      <div className="in">
        <div className="eyebrow">Undangan Pernikahan</div>
        <div className="names">{a}<em>&amp;</em>{b}</div>
        {first && <div className="date">{dateDots(first.date)}</div>}
        {greetName && (
          <div className="guest"><small>Kepada Yth. Bapak/Ibu/Saudara/i</small><b>{greetName}</b></div>
        )}
        <a className="btn solid" href="#" data-next>Lihat Undangan</a>
      </div>
    </section>,
  );

  // 2. Ayat
  if (c.verse && (c.verse.arabic || c.verse.translation)) {
    pages.push(
      <section key="ayat" className="ayat full">
        {deco("ayat")}
        {ph.ayat && <img className="bg" src={ph.ayat} alt="" />}
        <div className="shade" />
        <div className="in" style={{ paddingBottom: 20 }}>
          {geo && <div className="hilal" />}
          <div className="bismillah">بِسْمِ ٱللّٰهِ ٱلرَّحْمٰنِ ٱلرَّحِيْمِ</div>
          <div className="rule" />
          {c.verse.arabic && (
            <div className="serif" dir="rtl" style={{ fontSize: 22, lineHeight: 2, color: "var(--gold-soft)", marginBottom: 14 }}>
              {c.verse.arabic}
            </div>
          )}
          {c.verse.translation && <blockquote>“{c.verse.translation}”</blockquote>}
          {c.verse.source && <cite>{c.verse.source.toUpperCase()}</cite>}
        </div>
      </section>,
    );
  }

  // 3-4. Mempelai, satu lembar per orang
  people.forEach(([k, p], i) => {
    pages.push(
      <section key={`p-${k}`} className="couple">
        {deco("couple")}
        <div className="eyebrow">{i === 0 ? "Assalamu’alaikum" : "Bersama"}</div>
        <h2>Mempelai</h2>
        <div className="rule" />
        {i === 0 && (
          <p style={{ marginBottom: 14 }}>
            Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.
          </p>
        )}
        <div className="person" style={{ marginTop: 0 }}>
          {ph[k] && (
            <div className="frame">
              <img src={ph[k]} alt={p.full} style={{ objectPosition: k === "bride" ? "center 28%" : "center 35%" }} />
            </div>
          )}
          <h3>{p.full}</h3>
          {p.parents && <p><Lines text={p.parents} /></p>}
        </div>
      </section>,
    );
  });

  // 5. Save the date
  if (first) {
    pages.push(
      <section key="date" className="date-sec">
        {deco("date")}
        <div className="eyebrow">Menuju Hari Bahagia</div>
        <h2>Save The Date</h2>
        <div className="rule" />
        <p className="serif" style={{ fontSize: 22, color: "var(--cream)" }}>{dateLong(first.date)}</p>
        <Countdown to={c.countdownTo} />
        {(ph.save || ph.cover) && (
          <img className="photo-wide" src={ph.save || ph.cover} alt="" style={{ objectPosition: "center 40%" }} />
        )}
      </section>,
    );
  }

  // 6. Acara
  if (c.events.length > 0) {
    pages.push(
      <section key="event" className="event">
        {deco("event")}
        <div className="eyebrow">Rangkaian Acara</div>
        <h2>Waktu &amp; Tempat</h2>
        <div className="rule" />
        {c.events.map((e) => (
          <div className="ev" key={e.key} style={{ marginTop: 18 }}>
            <h3>{e.title}</h3>
            <div className="day">{dateLong(e.date)}</div>
            <div className="meta">
              {e.time ? e.time : "Jam: menyusul"}
              <br />
              {e.place || e.address ? (
                <>
                  {e.place && <>{e.place}<br /></>}
                  {e.address}
                </>
              ) : (
                "Lokasi: menyusul"
              )}
            </div>
            {(() => {
              // pakai link pin dari pemilik; bila kosong, buat pencarian Google Maps dari alamat
              const href = e.mapUrl || (e.address || e.place ? mapsSearchUrl([e.place, e.address].filter(Boolean).join(", ")) : "");
              return href ? <a className="btn" href={href} target="_blank" rel="noreferrer">Lihat di Google Maps</a> : null;
            })()}
          </div>
        ))}
      </section>,
    );
  }

  // 7+. Kisah cinta, satu bab per lembar
  c.story.forEach((s, i) => {
    pages.push(
      <section key={`story-${i}`} className="story">
        {deco("story")}
        <div className="eyebrow">Our Love Story</div>
        <div className="chap">{ROMAN[i] ?? i + 1}</div>
        <h2>{s.title}</h2>
        <div className="rule" />
        <p className="story-text">{s.text}</p>
      </section>,
    );
  });

  // Galeri, tiga foto per lembar
  chunkGallery(ph.gallery).forEach((chunk, i) => {
    pages.push(
      <section key={`gal-${i}`} className="gallery">
        {deco("gallery")}
        <div className="eyebrow">Momen Kami</div>
        <h2>Our Gallery</h2>
        <div className="rule" />
        <div className={`mosaic m${chunk.length}`}>
          {chunk.map((src, j) => (
            <img key={src + j} src={src} alt="" loading="lazy" style={{ objectPosition: "center 38%" }} />
          ))}
        </div>
      </section>,
    );
  });

  // Live streaming
  if (c.livestreamUrl) {
    pages.push(
      <section key="live" className="live">
        {deco("live")}
        {(ph.cover || ph.save) && <img className="bg" src={ph.cover || ph.save} alt="" />}
        <div className="shade" />
        <div className="in">
          <div className="play">&#9654;</div>
          <h2>Live Streaming</h2>
          <div className="rule" />
          <p style={{ color: "var(--cream)" }}>Bagi keluarga dan sahabat yang berhalangan hadir, saksikan acara kami secara virtual.</p>
          {first && <p style={{ margin: "10px 0 22px" }}>{dateLong(first.date)}{first.time ? ` · ${first.time}` : ""}</p>}
          <a className="btn" href={c.livestreamUrl} target="_blank" rel="noreferrer">Tonton Siaran</a>
        </div>
      </section>,
    );
  }

  // Amplop digital
  if (c.gifts.length > 0 || c.giftAddress?.address) {
    pages.push(
      <section key="gift" className="event gift-page">
        {deco("rsvp")}
        <div className="eyebrow">Tanda Kasih</div>
        <h2>Amplop Digital</h2>
        <div className="rule" />
        <p className="gift-intro">
          Kehadiran dan doa restu Anda adalah hadiah terbaik bagi kami. Bagi Bapak/Ibu/Saudara/i yang
          ingin berbagi tanda kasih, dapat melalui {c.gifts.length > 0 ? "rekening" : "alamat"} berikut.
        </p>
        {c.gifts.length > 0 && (
          <div className="gift-list">
            {c.gifts.map((g, i) => (
              <div className="bank" key={i}>
                <div className="bank-name">{g.bank}</div>
                <div className="bank-no">{groupNumber(g.number)}</div>
                <div className="bank-holder">a.n. {g.holder}</div>
                <CopyButton text={g.number} label="Salin nomor" />
              </div>
            ))}
          </div>
        )}
        {c.giftAddress?.address && (
          <div className="bank kado">
            <div className="bank-name">Kirim Kado</div>
            {c.giftAddress.recipient && <div className="kado-name">Penerima: {c.giftAddress.recipient}</div>}
            <div className="kado-addr">{c.giftAddress.address}</div>
            <CopyButton
              text={[c.giftAddress.recipient, c.giftAddress.address].filter(Boolean).join("\n")}
              label="Salin alamat"
            />
          </div>
        )}
        {c.gifts.length > 0 && (
          <p className="gift-steps-line">Salin nomor rekening, buka aplikasi bank atau e-wallet, lalu transfer sesuai keikhlasan.</p>
        )}
        <p className="gift-note">Tanda kasih bersifat sukarela dan tidak mengurangi arti kehadiran Anda.</p>
      </section>,
    );
  }

  // RSVP
  pages.push(
    <section key="rsvp" className="rsvp">
      {deco("rsvp")}
      <div className="eyebrow">Konfirmasi Kehadiran</div>
      <h2>RSVP</h2>
      <div className="rule" />
      <RsvpBlock slug={slug} guest={guest} defaultName={data.visitorName} />
      <div className="wcount">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.5 3.4 6L4.5 21l4.3-2.1c1 .3 2 .4 3.2.4 5.5 0 10-3.6 10-8s-4.5-8.3-10-8.3Z"/></svg>
        {wishes.length} Ucapan
      </div>
      <div className="wbox">
        {wishes.length === 0 ? (
          <p className="wempty">Jadilah yang pertama mengirim ucapan dan doa.</p>
        ) : (
          wishes.map((w) => (
            <div className="wcard" key={w.id}>
              <div className="wavatar" style={{ background: avatarColor(w.name) }}>{initials(w.name)}</div>
              <div className="wbody">
                <div className="wname">
                  {w.name}
                  {w.rsvp === "hadir" && <span className="wbadge ok" title="Hadir">✓</span>}
                  {w.rsvp === "tidak" && <span className="wbadge no" title="Tidak hadir">✕</span>}
                </div>
                <p className="wtext">{w.message}</p>
                <div className="wtime">{timeAgo(w.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>,
  );

  // Penutup
  pages.push(
    <section key="footer" className="footer">
      {deco("footer")}
      {(ph.closing || ph.cover) && <img className="bg" src={ph.closing || ph.cover} alt="" style={{ objectPosition: "center 30%" }} />}
      <div className="shade" />
      <div className="in">
        <p style={{ color: "var(--cream)" }}>
          Merupakan kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
        <div className="rule" />
        <div className="eyebrow">Wassalamu’alaikum Wr. Wb.</div>
        <div className="names">{a} <em>&amp;</em> {b}</div>
        {c.closingNote && <div className="credit">{c.closingNote}</div>}
      </div>
    </section>,
  );

  return <Book>{pages}</Book>;
}
