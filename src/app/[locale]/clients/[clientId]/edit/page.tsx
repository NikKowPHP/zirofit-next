
import ClientForm from "@/components/clients/ClientForm";
import { getClientById, updateClient } from "../../actions";
import BackLink from "@/components/ui/BackLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Clients" });
  return {
    title: t("editClientTitle"),
  };
}

interface PageProps {
  params: {
    clientId: string;
    locale: string;
  };
}

export default async function EditClientPage({ params }: PageProps) {
  const { clientId } = params;
  const t = await getTranslations("Clients");
  const client = await getClientById(clientId);

  if (!client) {
    return notFound();
  }

  return (
    <div>
      <BackLink href="/clients" text={t("backToClientList")} />
      <ClientForm initialData={client} action={updateClient} />
    </div>
  );
}