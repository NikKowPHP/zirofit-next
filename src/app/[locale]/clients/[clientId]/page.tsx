
import { getClientDetails } from "../actions";
import { notFound } from "next/navigation";
import ClientDetailView from "@/components/clients/ClientDetailView";
interface PageProps {
  params: Promise<{
    clientId: string;
    locale: string;
  }>;
}
export default async function ClientDetailPage({  params,}: PageProps) {
  const { clientId } = await params;

  const client = await getClientDetails(clientId);

  if (!client) {
    notFound();
  }

  return <ClientDetailView client={client} />;
}