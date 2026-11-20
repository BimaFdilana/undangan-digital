import { requireUser } from "@/lib/auth";
import { getWishes } from "@/lib/dal";

export default async function WishesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const list = await getWishes(user, id);
  if (list.length === 0) {
    return <p className="rounded-xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">Belum ada ucapan dari tamu.</p>;
  }
  return (
    <ul className="space-y-3">
      {list.map((w) => (
        <li key={w.id} className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
          <p className="font-medium">{w.name}</p>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">{w.message}</p>
          <p className="mt-2 text-xs text-stone-400">{w.createdAt.toLocaleString("id-ID")}</p>
        </li>
      ))}
    </ul>
  );
}
