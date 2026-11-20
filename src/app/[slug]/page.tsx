import { InvitationView } from "../i/render";
import { invitationMetadata } from "../i/meta";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string | string[] }>;
};

export async function generateMetadata({ params }: Props) {
  return invitationMetadata((await params).slug);
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { to } = await searchParams;
  return <InvitationView slug={slug} token={null} to={to} />;
}
