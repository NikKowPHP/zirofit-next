import React from "react";
import Link from "next/link";

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Quick Actions
      </h2>
      <div className="space-y-2">
        <Link
          href="/clients/create"
          className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Add New Client
        </Link>
        <Link
          href="/clients"
          className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
        >
          Log Session
        </Link>
        <Link
          href="/clients"
          className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
        >
          Add Measurement
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
