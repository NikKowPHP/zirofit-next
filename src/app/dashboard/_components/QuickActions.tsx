import React from 'react';
import Link from 'next/link';

const QuickActions: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <Link
          href="/clients/create"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Client
        </Link>
        <Link
          href="/clients"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Log Session
        </Link>
        <Link
          href="/clients"
          className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Add Measurement
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;