import ClientForm from '../../../components/clients/ClientForm';
import Link from 'next/link';

export default async function CreateClientPage() {
  return (
    <div>
      <Link href="/clients" className="mb-4 inline-block">
        Back to Client List
      </Link>
      <ClientForm initialData={null} action={addClient} />
    </div>
  );
}
import { addClient } from '../actions';