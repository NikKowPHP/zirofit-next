import { getClientById } from '../actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ClientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientId: string };
}) {
  const client = await getClientById(params.clientId);
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/clients" className="text-sm text-indigo-600 hover:underline mb-2 block">&larr; Back to Client List</Link>
          <h1 className="text-2xl font-bold text-gray-800">Client Details: {client.name}</h1>
        </div>
        <Link href={`/clients/${client.id}/edit`} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50">
            Edit Client Info
        </Link>
      </div>
      {children}
    </div>
  );
}