"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PlusIcon, UserGroupIcon, LinkIcon } from "@heroicons/react/24/outline";
import DeleteClientButton from "@/components/clients/DeleteClientButton";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  userId: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const LoadingLinkButton = ({ href, children, variant, size, className }: { href: string; children: React.ReactNode; variant: "secondary"; size: "sm"; className: string; }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Button asChild variant={variant} size={size} className={className} disabled={isLoading}>
            <Link href={href} onClick={() => setIsLoading(true)}>
                {isLoading ? (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    children
                )}
            </Link>
        </Button>
    );
};


export default function ClientGrid({ clients }: { clients: Client[] }) {
  const t = useTranslations("Clients");
  if (clients.length === 0) {
    return (
      <EmptyState
        icon={<UserGroupIcon className="h-12 w-12 text-gray-400" />}
        title={t("noClientsFound")}
        description={t("noClientsDescription")}
        action={
          <Button asChild>
            <Link href="/clients/create">
              <PlusIcon className="h-5 w-5 mr-2" />
              {t("addNewClient")}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {clients.map((client) => (
        <motion.div key={client.id} variants={itemVariants}>
          <Card className="transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
            <CardContent className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  {client.name}
                  {client.userId && (
                    <span
                      title="Linked Account"
                      className="text-green-600 dark:text-green-400"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </span>
                  )}
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

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-grow">
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
                <LoadingLinkButton
                  href={`/clients/${client.id}`}
                  variant="secondary"
                  size="sm"
                  className="transition-all duration-200"
                >
                  {t("manageButton")}
                </LoadingLinkButton>
                <LoadingLinkButton
                  href={`/clients/${client.id}/edit`}
                  variant="secondary"
                  size="sm"
                  className="transition-all duration-200"
                >
                  {t("editButton")}
                </LoadingLinkButton>
                <DeleteClientButton clientId={client.id} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}