import { InvitationView } from "../../render";
import { invitationMetadata } from "../../meta";

type Props = { params: Promise<{ slug: string; token: string }> };

export async function generateMetadata({ params }: Props) {
  return invitationMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  const { slug, token } = await params;
  return <InvitationView slug={slug} token={token} />;
}
