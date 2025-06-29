import { getClientDetails } from "../actions";
import { notFound } from "next/navigation";
import ClientDetailView from "@/components/clients/ClientDetailView";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClientDetails(clientId);

  if (!client) {
    notFound();
  }

  return <ClientDetailView client={client} />;
}
