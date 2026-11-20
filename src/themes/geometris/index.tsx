import { dateDots } from "@/lib/format";
import { Shell } from "../shell";
import { Sections, coupleNames, type DecoFn } from "../shared/sections";
import type { ThemeData } from "../types";
import "./theme.css";
import "../book.css";
import { ThemeFonts } from "../fonts";

const FULL = new Set(["cover", "ayat", "footer"]);

const deco: DecoFn = (s) => (
  <>
    {FULL.has(s) ? (
      <div className="o-arch" />
    ) : (
      <>
        <div className="o-frame"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
        <div className="o-ros" />
      </>
    )}
    <div className="o-gb t" />
    <div className="o-gb b" />
  </>
);

export function GeometrisTheme({ data }: { data: ThemeData }) {
  const { a, b } = coupleNames(data.content);
  const first = data.content.events[0];
  return (
    <div className="t-geometris" data-palette={data.content.palette ?? "hijau"}>
      <ThemeFonts />
      <Shell
        theme="geometris"
        slug={data.slug}
        token={data.guest?.token ?? null}
        music={data.content.music}
        gate={{
          names: `${a} & ${b}`,
          dateText: first ? dateDots(first.date) : "",
          guestName: data.guest?.name ?? data.visitorName ?? null,
          photo: data.content.photos.gate,
        }}
      >
        <div className="stage">
          <Sections data={data} deco={deco} geo />
        </div>
      </Shell>
    </div>
  );
}
