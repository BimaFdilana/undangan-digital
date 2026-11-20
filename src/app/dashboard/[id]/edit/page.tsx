import { requireUser } from "@/lib/auth";
import { getInvitation } from "@/lib/dal";
import { EditForm } from "./edit-form";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const inv = await getInvitation(user, id);
  return <EditForm inv={{ id: inv.id, title: inv.title, theme: inv.theme, status: inv.status, content: inv.content }} />;
}
