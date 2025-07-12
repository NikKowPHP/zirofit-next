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
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
      <div className="p-2">
        <nav
          className="bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1 flex justify-center"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                tab.id === activeTab
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-700/50"
              } flex-1 whitespace-nowrap py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-200 dark:focus:ring-offset-neutral-800`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
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