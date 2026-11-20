import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getInvitation } from "@/lib/dal";
import { Tabs } from "./tabs";

export default async function InvitationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const inv = await getInvitation(user, id);
  return (
    <>
      <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-800">← Semua undangan</Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{inv.title}</h1>
          <p className="text-sm text-stone-500">/{inv.slug} · {inv.status === "published" ? "Terbit" : "Draf (belum bisa dibuka tamu)"}</p>
        </div>
        <Link href={`/i/${inv.slug}`} target="_blank" className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-50">
          Pratinjau ↗
        </Link>
      </div>
      <Tabs id={inv.id} />
      <div className="mt-6">{children}</div>
    </>
  );
}
