// src/components/auth/LogoutButton.tsx
"use client";

import { logoutUser } from "../../app/auth/actions";
import { useTransition } from "react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
    >
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
}
