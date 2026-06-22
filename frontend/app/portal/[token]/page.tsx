import { notFound } from "next/navigation";
import PortalClient from "./_components/portal_client";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: Props) {
  const { token } = await params;
  const res = await fetch(`${process.env.API_URL}/portal/${token}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const project = await res.json();

  return <PortalClient project={project} freelancerName={""} token={token} />;
}