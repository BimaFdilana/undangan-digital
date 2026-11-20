import { dateDots } from "@/lib/format";
import { Shell } from "../shell";
import { coupleNames } from "../shared/sections";
import type { ThemeData } from "../types";
import { PastelSections } from "./sections";
import "./theme.css";
import "../book.css";

function PastelFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Allura&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500&display=swap"
      />
    </>
  );
}

export function PastelTheme({ data }: { data: ThemeData }) {
  const { a, b } = coupleNames(data.content);
  const first = data.content.events[0];
  return (
    <div className="t-pastel">
      <PastelFonts />
      <Shell
        theme="pastel"
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
          <PastelSections data={data} />
        </div>
      </Shell>
    </div>
  );
}
