import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import ClientGrid from "@/components/clients/ClientGrid";
import { getTrainerClients } from "./actions";

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
  return <ClientGrid clients={clients} />;
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
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ClientCardSkeleton />
            <ClientCardSkeleton />
            <ClientCardSkeleton />
            <ClientCardSkeleton />
            <ClientCardSkeleton />
            <ClientCardSkeleton />
          </div>
        }
      >
        <ClientList />
      </Suspense>
    </div>
  );
}