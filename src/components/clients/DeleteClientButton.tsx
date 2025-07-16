
"use client";

import { useState } from "react";
import { deleteClient } from "../../app/clients/actions";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmationModal } from "../ui/DeleteConfirmationModal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface DeleteClientButtonProps {
  clientId: string;
}

export default function DeleteClientButton({
  clientId,
}: DeleteClientButtonProps) {
  const t = useTranslations("Clients");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirmDelete = async () => {
    setIsPending(true);
    const result = await deleteClient(clientId);
    if (result.message === "Client deleted.") {
      toast.success(t("clientDeleted"));
    } else {
      toast.error(result.message || t("failedToDeleteClient"));
    }
    setIsPending(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onConfirm={handleConfirmDelete}
        title={t("deleteClientTitle")}
        description={t("deleteClientDescription")}
        isPending={isPending}
      />
      <Button
        variant="tertiary"
        size="sm"
        className="text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:bg-red-900/50"
        onClick={() => setIsModalOpen(true)}
      >
        {t("deleteButton")}
      </Button>
    </>
  );
}
