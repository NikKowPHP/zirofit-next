"use client";

import { deleteClient } from './src/app/clients/actions';

interface DeleteClientButtonProps {
  clientId: string;
}

export default function DeleteClientButton({ clientId }: DeleteClientButtonProps) {
  return (
    <button
      className="text-red-600 hover:text-red-900"
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