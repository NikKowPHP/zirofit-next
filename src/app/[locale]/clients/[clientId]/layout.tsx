
import { getClientById } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import BackLink from "@/components/ui/BackLink";
import { getTranslations } from "next-intl/server";
interface LayoutProps {
   children: React.ReactNode;
  params: Promise<{
    clientId: string;
    locale: string;
  }>;
}
export default async function ClientDetailLayout({
  children,
  params,
}: LayoutProps) {
  const t = await getTranslations("Clients");
  const { clientId } = await params;
  const client = await getClientById(clientId);
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <BackLink href="/clients" text={t("backToClientList")} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {client.name}
          </h1>
        </div>
        <Button asChild variant="secondary">
          <Link href={`/clients/${client.id}/edit`}>
            {t("editClientInfo")}
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}