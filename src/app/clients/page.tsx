import Link from "next/link";
import { getTrainerClients } from "./actions";
import { Button } from "../../components/ui/Button";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import DeleteClientButton from "@/components/clients/DeleteClientButton";
import { Card, CardContent } from "@/components/ui/Card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

function ClientCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="space-y-2 text-sm">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end space-x-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

async function ClientList() {
  const clients = await getTrainerClients();

  if (clients.length === 0) {
    return (
      <div className="col-span-full md:col-span-2 lg:col-span-3">
        <EmptyState
          icon={<UserGroupIcon className="h-12 w-12 text-gray-400" />}
          title="No clients found"
          description="Get started by adding your first client."
          action={
            <Button asChild>
              <Link href="/clients/create">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Client
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      {clients.map((client: Client) => (
        <Card
          key={client.id}
          className="transition-all duration-200 hover:shadow-2xl hover:-translate-y-1"
        >
          <CardContent className="p-4">
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
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="transition-all duration-200"
              >
                <Link href={`/clients/${client.id}`}>Manage</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="transition-all duration-200"
              >
                <Link href={`/clients/${client.id}/edit`}>Edit</Link>
              </Button>
              <DeleteClientButton clientId={client.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default function ClientListPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Client Management
        </h1>
        <Link href="/clients/create">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Client
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense
          fallback={
            <>
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
            </>
          }
        >
          <ClientList />
        </Suspense>
      </div>
    </div>
  );
}