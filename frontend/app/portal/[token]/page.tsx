// Página pública — sin auth. Fetch al backend Python.

import { notFound } from "next/navigation";
import PortalClient from "./_components/portal_client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Props {
  params: { token: string };
}

export default async function PortalPage({ params }: Props) {
  const res = await fetch(`${API_URL}/portal/${params.token}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const project = await res.json();

  return <PortalClient project={project} tasks={[]} freelancerName={""} />; //chusmear si esto tira error
}