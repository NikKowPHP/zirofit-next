import { getClientDetails } from '../actions';
import { notFound } from 'next/navigation';
import ClientDetailView from '@/components/clients/ClientDetailView';

export default async function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const client = await getClientDetails(params.clientId);

  if (!client) {
    notFound();
  }

  return <ClientDetailView client={client} />;
}