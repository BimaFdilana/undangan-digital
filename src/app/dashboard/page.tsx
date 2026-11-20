import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listInvitations } from "@/lib/dal";

export const metadata = { title: "Undangan saya" };

export default async function DashboardPage() {
  const user = await requireUser();
  const items = await listInvitations(user);
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Undangan {user.role === "admin" ? "(semua)" : "saya"}</h1>
      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">Belum ada undangan.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i.id} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h2 className="text-lg font-medium">{i.title}</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs ${i.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {i.status === "published" ? "Terbit" : "Draf"}
                </span>
              </div>
              <p className="mb-4 text-sm text-stone-500">
                /{i.slug} · tema {i.theme}
                {user.role === "admin" && <> · pemilik: {i.ownerName}</>}
              </p>
              <dl className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-stone-50 py-2"><dt className="text-xs text-stone-500">Tamu</dt><dd className="font-semibold">{i.guestCount}</dd></div>
                <div className="rounded-lg bg-stone-50 py-2"><dt className="text-xs text-stone-500">Dibuka</dt><dd className="font-semibold">{i.openedCount}</dd></div>
                <div className="rounded-lg bg-stone-50 py-2"><dt className="text-xs text-stone-500">Hadir</dt><dd className="font-semibold">{i.hadirCount}</dd></div>
              </dl>
              <div className="flex gap-2">
                <Link href={`/dashboard/${i.id}`} className="rounded-lg bg-emerald-800 px-3 py-1.5 text-sm text-white hover:bg-emerald-900">Kelola</Link>
                <Link href={`/i/${i.slug}`} target="_blank" className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">Lihat</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
