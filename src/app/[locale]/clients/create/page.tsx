
import ClientForm from "../../../../components/clients/ClientForm";
import BackLink from "@/components/ui/BackLink";
import { addClient } from "../actions";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Clients" });
  return {
    title: t("createClientTitle"),
  };
}

export default async function CreateClientPage() {
  const t = await getTranslations("Clients");
  return (
    <div>
      <BackLink href="/clients" text={t("backToClientList")} />
      <ClientForm initialData={null} action={addClient} />
    </div>
  );
}