import type { ReactNode } from "react";
import { dateDots, dateLong, groupNumber } from "@/lib/format";
import { googleCalendarUrl, mapsSearchUrl } from "@/lib/links";
import { Book } from "../book";
import { Countdown, CopyButton, RsvpBlock } from "../client";
import { avatarColor, initials, timeAgo } from "@/lib/format";
import { coupleNames } from "../shared/sections";
import type { ThemeData } from "../types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** ranting kecil berwarna biru, penanda tiap bagian */
function Sprig({ white = false }: { white?: boolean }) {
  const c = white ? "#ffffff" : "#7f97b8";
  return (
    <svg className="pc-sprig" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round">
      <path d="M24 44C24 32 24 24 24 14" />
      <path d="M24 34c-7-1-11-5-11-11 7 0 11 4 11 11Z" fill={c} fillOpacity=".25" />
      <path d="M24 28c6-1 10-4 11-10-6 0-10 4-11 10Z" fill={c} fillOpacity=".25" />
      <path d="M24 20c-4-2-6-5-6-9 4 1 6 4 6 9Z" fill={c} fillOpacity=".25" />
      <circle cx="24" cy="10" r="2" fill={c} />
      <circle cx="31" cy="12" r="1.2" fill={c} />
      <circle cx="17" cy="14" r="1.2" fill={c} />
    </svg>
  );
}

/** garis bunga samar untuk latar halaman acara */
function FlowerArt() {
  return (
    <svg className="bg pc-flowers" viewBox="0 0 430 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="#7f97b8" strokeWidth="1.1">
      <g opacity=".22">
        <path d="M-20 300C20 250 80 240 130 270C90 290 40 320 -20 300Z" />
        <path d="M-10 330C40 290 100 300 140 340C100 350 40 360 -10 330Z" />
        <path d="M10 380C50 330 110 350 120 400C90 410 40 420 10 380Z" />
        <path d="M70 280C60 230 90 190 140 180C140 230 120 260 70 280Z" />
        <path d="M60 300c30-10 60-5 90 15" />
      </g>
      <g opacity=".2">
        <path d="M450 620C410 560 350 560 300 600C340 625 400 640 450 620Z" />
        <path d="M440 660C390 620 330 640 300 690C350 700 410 700 440 660Z" />
        <path d="M430 730C380 690 330 720 320 770C360 785 410 780 430 730Z" />
        <path d="M330 590C320 540 350 500 400 490C405 540 380 575 330 590Z" />
      </g>
    </svg>
  );
}

/** "Putri ke-3 dari|Bapak A & Ibu B" -> { sub: "Putri ke-3 dari", names: ["Bapak A", "Ibu B"] } */
function parentLines(text: string) {
  const [sub, ...rest] = text.split("|").map((x) => x.trim()).filter(Boolean);
  const names = rest
    .flatMap((l) => l.split(/\s+&\s+/))
    .map((l) => l.replace(/^&\s*/, "").trim())
    .filter(Boolean);
  return { sub: sub ?? "", names };
}

function Person({ label, name, parents }: { label: string; name: string; parents: string }) {
  const { sub, names } = parentLines(parents);
  return (
    <div className="pc-person">
      <Sprig />
      <div className="pc-label">{label}</div>
      <div className="pc-line" />
      <div className="pc-name">{name}</div>
      {sub && <div className="pc-sub">{sub}</div>}
      {names.map((n) => <div className="pc-parent" key={n}>{n}</div>)}
    </div>
  );
}

function chunkGallery(list: string[]) {
  const out: string[][] = [];
  for (let i = 0; i < list.length; i += 3) out.push(list.slice(i, i + 3));
  if (out.length > 1 && out[out.length - 1].length === 1) {
    const last = out.pop()!;
    out[out.length - 1].push(...last);
  }
  return out;
}

export function PastelSections({ data }: { data: ThemeData }) {
  const { content: c, guest, slug, wishes } = data;
  const { a, b } = coupleNames(c);
  const first = c.events[0];
  const ph = c.photos;
  const [pFirst, pSecond] =
    c.nameOrder === "groom"
      ? ([["MEMPELAI PRIA", c.groom], ["MEMPELAI WANITA", c.bride]] as const)
      : ([["MEMPELAI WANITA", c.bride], ["MEMPELAI PRIA", c.groom]] as const);
  const pages: ReactNode[] = [];

  // 1. Sampul: foto penuh, nama kaligrafi, tanggal, hitung mundur
  pages.push(
    <section key="cover" className="pc-cover">
      {ph.cover && <img className="bg" src={ph.cover} alt="" style={{ objectPosition: ph.coverFocus ?? "center 35%" }} />}
      <div className="bg pc-cover-shade" />
      <div className="pc-top">THE WEDDING OF</div>
      <div className="pc-names">
        <span className="n1">{a}</span>
        <em>and</em>
        <span className="n2">{b}</span>
      </div>
      <div className="pc-bottom">
        {first && <div className="pc-date">{dateDots(first.date).replace(/ · /g, " • ")}</div>}
        <Countdown to={c.countdownTo} />
      </div>
    </section>,
  );

  // 2. Cerita (bila ada)
  if (c.story.length > 0) {
    pages.push(
      <section key="story" className="pc-blue pc-story">
        <div className="pc-chapters">
          {c.story.map((s, i) => (
            <div className="pc-chapter" key={i}>
              <b>Chapter {ROMAN[i] ?? i + 1}</b>
              <i>{s.title}</i>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>,
    );
  }

  // 3. Mempelai + foto berpudar putih di bawah
  pages.push(
    <section key="couple" className="pc-white pc-couple">
      <Person label={pFirst[0]} name={pFirst[1].full} parents={pFirst[1].parents} />
      <Person label={pSecond[0]} name={pSecond[1].full} parents={pSecond[1].parents} />
      {(ph.save || ph.bride) && (
        <div className="pc-fadephoto">
          <img src={ph.save || ph.bride} alt="" style={{ objectPosition: "center 25%" }} />
        </div>
      )}
    </section>,
  );

  // 4. Akad dan resepsi
  if (c.events.length > 0) {
    pages.push(
      <section key="event" className="pc-white pc-events">
        <FlowerArt />
        {c.events.map((e) => {
          const place = [e.place, e.address].filter(Boolean).join(", ");
          const map = e.mapUrl || (place ? mapsSearchUrl(place) : "");
          return (
            <div className="pc-event" key={e.key}>
              <Sprig />
              <div className="pc-label">{e.title.toUpperCase()}</div>
              <div className="pc-line" />
              <div className="pc-edate">{dateLong(e.date).toUpperCase()}</div>
              <div className="pc-etime">{e.time || "Jam menyusul"}</div>
              <a
                className="pc-cal"
                target="_blank"
                rel="noreferrer"
                href={googleCalendarUrl({
                  title: `${e.title} ${a} & ${b}`,
                  date: e.date, time: e.time, location: place,
                  details: `Undangan pernikahan ${a} & ${b}`,
                })}
              >
                TAMBAH KE KALENDER
              </a>
              {e.place && <div className="pc-place">{e.place.toUpperCase()}</div>}
              {e.address && <div className="pc-addr">{e.address}</div>}
              {map ? (
                <a className="pc-pill" href={map} target="_blank" rel="noreferrer">Lihat Lokasi</a>
              ) : (
                <span className="pc-pill off">Lokasi segera diinformasikan</span>
              )}
            </div>
          );
        })}
      </section>,
    );
  }

  // 5. Galeri: satu halaman yang digulir sampai habis; setelah itu halaman terangkat ke halaman berikutnya
  if (ph.gallery.length > 0) {
    pages.push(
      <section key="gallery" className="pc-white pc-gallery">
        <Sprig />
        <div className="pc-label">MOMEN KAMI</div>
        <div className="pc-line" />
        <div className="pc-masonry">
          {ph.gallery.map((src, i) => <img key={src + i} src={src} alt="" />)}
        </div>
      </section>,
    );
  }

  // 9. Ayat
  if (c.verse && (c.verse.translation || c.verse.arabic)) {
    pages.push(
      <section key="ayat" className="pc-mist pc-ayat">
        <div className="pc-script">{a}</div>
        <div className="pc-script s2">{b}</div>
        {c.verse.arabic && <div className="pc-arab" dir="rtl">{c.verse.arabic}</div>}
        {c.verse.translation && <blockquote>“{c.verse.translation}”</blockquote>}
        {c.verse.source && <cite>{c.verse.source.toUpperCase()}</cite>}
      </section>,
    );
  }

  // 6. Ajakan Instagram (bila ada hashtag/akun)
  if (c.hashtag || c.instagram) {
    pages.push(
      <section key="ig" className="pc-ig">
        {(ph.closing || ph.cover) && <img className="bg" src={ph.closing || ph.cover} alt="" style={{ objectPosition: "center 30%" }} />}
        <div className="pc-igbox">
          <p>Bagikan hari spesial ini ke Instagram</p>
          {c.hashtag && <b>{c.hashtag}</b>}
          {c.instagram && <span>{c.instagram}</span>}
        </div>
      </section>,
    );
  }

  // 7. RSVP (hanya untuk tamu yang dikenali)
  if (guest) {
    pages.push(
      <section key="rsvp" className="pc-blue pc-rsvp">
        <Sprig white />
        <div className="pc-title">RSVP</div>
        <p className="pc-lead">Konfirmasi kehadiranmu di bawah ini</p>
        <div className="pc-card">
          <RsvpBlock slug={slug} guest={guest} mode="rsvp" />
        </div>
      </section>,
    );
  }

  // 8. Wedding gift
  if (c.gifts.length > 0 || c.giftAddress?.address) {
    pages.push(
      <section key="gift" className="pc-white gift-page pc-gift">
        <Sprig />
        <div className="pc-label">WEDDING GIFT</div>
        <div className="pc-line" />
        <p className="pc-lead dark">
          Doa restu yang kami terima sangat berarti, namun jika memberi merupakan tanda kasih,
          tentunya semakin melengkapi kebahagiaan kami.
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
        {!c.giftAddress?.address && (
          <div className="bank kado">
            <div className="bank-name">Kirim Kado</div>
            <div className="kado-addr">Alamat pengiriman kado segera diinformasikan.</div>
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
      </section>,
    );
  }

  // 10. Ucapan & doa (formulir + daftar di dalam undangan)
  pages.push(
    <section key="wishes" className="pc-white pc-wishes">
      <Sprig />
      <div className="pc-label">UCAPAN &amp; DOA</div>
      <div className="pc-line" />
      <RsvpBlock slug={slug} guest={guest} defaultName={data.visitorName} mode="wish" />
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

  // 11. Penutup
  pages.push(
    <section key="footer" className="pc-end">
      {(ph.closing || ph.cover) && <img className="bg" src={ph.closing || ph.cover} alt="" style={{ objectPosition: "center 30%" }} />}
      <div className="bg pc-end-shade" />
      <div className="pc-endtext">
        <p>Merupakan kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>
        <div className="pc-script w">{a}</div>
        <div className="pc-script w s2">{b}</div>
      </div>
    </section>,
  );

  return <Book>{pages}</Book>;
}
