"use client";

"use client";

import { useState, Suspense, lazy } from "react";
import type {
  Client,
  ClientSessionLog,
  ClientProgressPhoto,
} from "@/app/clients/actions/client-actions";
import type { ClientMeasurement } from "@/app/clients/actions/measurement-actions";
const ManageClientMeasurements = lazy(
  () => import("./modules/ManageClientMeasurements"),
);
const ManageClientProgressPhotos = lazy(
  () => import("./modules/ManageClientProgressPhotos"),
);
const ManageClientSessionLogs = lazy(
  () => import("./modules/ManageClientSessionLogs"),
);
const ClientStatistics = lazy(() => import("./modules/ClientStatistics"));

type ClientWithDetails = Client & {
  measurements: ClientMeasurement[];
  progressPhotos: ClientProgressPhoto[];
  sessionLogs: ClientSessionLog[];
};

interface ClientDetailViewProps {
  client: ClientWithDetails;
}

const tabs = [
  { name: "Statistics", id: "stats" },
  { name: "Measurements", id: "measurements" },
  { name: "Progress Photos", id: "photos" },
  { name: "Session Logs", id: "logs" },
];

export default function ClientDetailView({ client }: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState("stats");

  const tabContent: { [key: string]: React.ReactNode } = {
    stats: <ClientStatistics measurements={client.measurements} />,
    measurements: (
      <ManageClientMeasurements
        clientId={client.id}
        initialMeasurements={client.measurements}
      />
    ),
    photos: (
      <ManageClientProgressPhotos
        clientId={client.id}
        initialProgressPhotos={client.progressPhotos}
      />
    ),
    logs: (
      <ManageClientSessionLogs
        clientId={client.id}
        initialSessionLogs={client.sessionLogs}
      />
    ),
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6 overflow-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                tab.id === activeTab
                  ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
              } whitespace-nowrap py-3 px-2 border-b-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-6 text-gray-600 dark:text-gray-300">
              <span className="animate-pulse">Loading content...</span>
            </div>
          }
        >
          {tabContent[activeTab]}
        </Suspense>
      </div>
    </div>
  );
}
