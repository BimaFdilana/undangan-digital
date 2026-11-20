import { dateDots } from "@/lib/format";
import { Shell } from "../shell";
import { Sections, coupleNames, type DecoFn } from "../shared/sections";
import type { ThemeData } from "../types";
import "./theme.css";
import "../book.css";
import { ThemeFonts } from "../fonts";

const deco: DecoFn = () => (
  <>
    <div className="o-band" />
    <div className="o-frame"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
  </>
);

export function AdatTheme({ data }: { data: ThemeData }) {
  const { a, b } = coupleNames(data.content);
  const first = data.content.events[0];
  return (
    <div className="t-adat">
      <ThemeFonts />
      <Shell
        theme="adat"
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
          <Sections data={data} deco={deco} />
        </div>
      </Shell>
    </div>
  );
}
