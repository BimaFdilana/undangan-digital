import { requireAdmin } from "@/lib/auth";
import { listOwners } from "@/lib/dal";
import { NewForm } from "./new-form";

export const metadata = { title: "Buat undangan" };

export default async function NewInvitationPage() {
  await requireAdmin();
  const owners = await listOwners();
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Buat undangan baru</h1>
      <NewForm owners={owners} />
    </>
  );
}
