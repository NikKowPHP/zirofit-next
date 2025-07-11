import Link from "next/link";
import { getTrainerClients } from "./actions";
import { Button } from "../../components/ui/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import DeleteClientButton from "@/components/clients/DeleteClientButton";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

export default async function ClientListPage() {
  const clients = await getTrainerClients();

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Client Management
        </h2>
        <Link href="/clients/create">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Client
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? (
          clients.map((client: Client) => (
            <div
              key={client.id}
              className="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {client.name}
                </h3>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : client.status === "inactive"
                        ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {client.email && (
                  <div className="flex items-center">
                    <span className="mr-2">📧</span>
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center">
                    <span className="mr-2">📱</span>
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end space-x-2">
                <Link
                  href={`/clients/${client.id}`}
                  className="px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md"
                >
                  Manage
                </Link>
                <Link
                  href={`/clients/${client.id}/edit`}
                  className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md"
                >
                  Edit
                </Link>
                <DeleteClientButton clientId={client.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No clients found.
          </div>
        )}
      </div>
    </div>
  );
}
