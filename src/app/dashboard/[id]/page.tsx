import { deleteGuests } from "@/app/actions/guests";
import { requireUser } from "@/lib/auth";
import { getGuests, getInvitation } from "@/lib/dal";
import { dateLong } from "@/lib/format";
import { guestLink, waMessage, waUrl } from "@/lib/links";
import { BulkAddForm, GuestTable } from "./guest-tools";

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const inv = await getInvitation(user, id);
  const list = await getGuests(user, id);

  const first = inv.content.events[0];
  const dateText = first ? dateLong(first.date) : "";
  const seen = new Map<string, number>();
  for (const g of list) seen.set(g.name.toLowerCase(), (seen.get(g.name.toLowerCase()) ?? 0) + 1);
  const rows = list.map((g) => {
    const link = guestLink(inv.slug, g.token, g.name, (seen.get(g.name.toLowerCase()) ?? 0) > 1);
    return {
      id: g.id, name: g.name, groupName: g.groupName, phone: g.phone, link,
      waHref: waUrl(g.phone, waMessage({ title: inv.title, dateText, name: g.name, link })),
      openCount: g.openCount, rsvp: g.rsvp, pax: g.pax,
    };
  });

  const hadir = list.filter((g) => g.rsvp === "hadir");
  const stats = [
    { label: "Total tamu", value: list.length },
    { label: "Sudah membuka", value: list.filter((g) => g.openCount > 0).length },
    { label: "Konfirmasi hadir", value: hadir.length },
    { label: "Jumlah orang hadir", value: hadir.reduce((s, g) => s + g.pax, 0) },
  ];

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <dt className="text-xs text-stone-500">{s.label}</dt>
            <dd className="text-2xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>
      <BulkAddForm invitationId={inv.id} />
      <GuestTable rows={rows} deleteAction={deleteGuests.bind(null, inv.id)} />
    </div>
  );
}
