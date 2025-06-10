import ClientForm from '@/components/clients/ClientForm';
import { getClientById, updateClient } from '@/app/clients/actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Client',
};

interface PageProps {
  params: {
    clientId: string;
  };
}

export default async function EditClientPage({
  params: { clientId }
}: PageProps) {
  const client = await getClientById(clientId);

  if (!client) {
    return notFound();
  }

  return (
    <div>
      <Link href="/clients" className="mb-4 inline-block">
        Back to Client List
      </Link>
      <ClientForm initialData={client} action={updateClient} />
    </div>
  );
}