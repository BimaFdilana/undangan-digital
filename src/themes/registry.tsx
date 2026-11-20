import { AdatTheme } from "./adat";
import { GeometrisTheme } from "./geometris";
import { PastelTheme } from "./pastel";
import type { ThemeData } from "./types";

const THEMES: Record<string, (p: { data: ThemeData }) => React.ReactElement> = {
  adat: AdatTheme,
  geometris: GeometrisTheme,
  pastel: PastelTheme,
};

export function renderTheme(key: string, data: ThemeData) {
  const T = THEMES[key] ?? GeometrisTheme;
  return <T data={data} />;
}
