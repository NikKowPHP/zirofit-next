"use client";

import { deleteClient } from "../../app/clients/actions";

interface DeleteClientButtonProps {
  clientId: string;
}

export default function DeleteClientButton({
  clientId,
}: DeleteClientButtonProps) {
  return (
    <button
      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:text-red-500 dark:hover:bg-red-900/50 rounded-md"
      onClick={() => {
        if (window.confirm("Are you sure you want to delete this client?")) {
          deleteClient(clientId);
        }
      }}
    >
      Delete
    </button>
  );
}
