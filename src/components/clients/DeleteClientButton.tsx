"use client";

import { deleteClient } from "../../app/clients/actions";
import { Button } from "@/components/ui";

interface DeleteClientButtonProps {
  clientId: string;
}

export default function DeleteClientButton({
  clientId,
}: DeleteClientButtonProps) {
  return (
    <Button
      variant="tertiary"
      size="sm"
      className="text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:bg-red-900/50"
      onClick={() => {
        if (window.confirm("Are you sure you want to delete this client?")) {
          deleteClient(clientId);
        }
      }}
    >
      Delete
    </Button>
  );
}