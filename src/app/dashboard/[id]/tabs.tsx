"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Tabs({ id }: { id: string }) {
  const path = usePathname();
  const items = [
    { href: `/dashboard/${id}`, label: "Tamu & link" },
    { href: `/dashboard/${id}/wishes`, label: "Ucapan" },
    { href: `/dashboard/${id}/edit`, label: "Data undangan" },
  ];
  return (
    <nav className="flex gap-1 border-b border-stone-200">
      {items.map((t) => {
        const active = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${active ? "border-emerald-800 font-medium text-emerald-900" : "border-transparent text-stone-500 hover:text-stone-800"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
