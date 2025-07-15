import ClientForm from "@/components/clients/ClientForm";
import { getClientById, updateClient } from "@/app/clients/actions";
import BackLink from "@/components/ui/BackLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Client",
};

interface PageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) {
    return notFound();
  }

  return (
    <div>
      <BackLink href="/clients" text="← Back to Client List" />
      <ClientForm initialData={client} action={updateClient} />
    </div>
  );
}