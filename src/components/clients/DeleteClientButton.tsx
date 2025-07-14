"use client";

import { useState } from "react";
import { deleteClient } from "../../app/clients/actions";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmationModal } from "../ui/DeleteConfirmationModal";
import { toast } from "sonner";

interface DeleteClientButtonProps {
  clientId: string;
}

export default function DeleteClientButton({
  clientId,
}: DeleteClientButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirmDelete = async () => {
    setIsPending(true);
    const result = await deleteClient(clientId);
    if (result.message === "Client deleted.") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
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
        title="Delete Client"
        description="Are you sure you want to delete this client? This will also remove all associated session logs, measurements, and photos. This action cannot be undone."
        isPending={isPending}
      />
      <Button
        variant="tertiary"
        size="sm"
        className="text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:bg-red-900/50"
        onClick={() => setIsModalOpen(true)}
      >
        Delete
      </Button>
    </>
  );
}