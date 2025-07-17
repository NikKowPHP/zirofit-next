
import ClientForm from "@/components/clients/ClientForm";
import { getClientById, updateClient } from "../../actions";
import BackLink from "@/components/ui/BackLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Locale } from "@/i18n";
interface MetadataProps {
   params: Promise<{clientId: string, locale: Locale }> 
}
export async function generateMetadata({ params } 
: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Clients" });
  return {
    title: t("editClientTitle"),
  };
}

interface PageProps {
  params: Promise<{
    clientId: string;
    locale: string;
  }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { clientId } = await params;
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