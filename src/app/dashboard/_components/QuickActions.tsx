import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const QuickActions: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Quick Actions
      </h2>
      <div className="space-y-2">
        <Button asChild className="w-full">
          <Link href="/clients/create">Add New Client</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/clients">Log a Session</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/clients">Add Measurement</Link>
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
