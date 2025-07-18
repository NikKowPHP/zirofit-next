
"use client";

import { useState, Suspense, lazy, useTransition } from "react";
import type {
  Client,
  ClientSessionLog,
  ClientProgressPhoto,
} from "@/app/[locale]/clients/actions/client-actions.ts";
import type { ClientMeasurement } from "@/app/[locale]/clients/actions/measurement-actions";
import type { ClientExerciseLog } from "@/app/[locale]/clients/actions/exercise-log-actions";
import { useTranslations } from "next-intl";

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
const ManageClientExerciseLogs = lazy(
  () => import("./modules/ManageClientExerciseLogs"),
);

type ClientWithDetails = Client & {
  measurements: ClientMeasurement[];
  progressPhotos: ClientProgressPhoto[];
  sessionLogs: ClientSessionLog[];
  exerciseLogs: ClientExerciseLog[];
};

interface ClientDetailViewProps {
  client: ClientWithDetails;
}

export default function ClientDetailView({ client }: ClientDetailViewProps) {
  const t = useTranslations("Clients");
  const [activeTab, setActiveTab] = useState("stats");
  const [isPending, startTransition] = useTransition();

  const tabs = [
    { name: t("clientDetail_statistics"), id: "stats" },
    { name: t("clientDetail_measurements"), id: "measurements" },
    { name: t("clientDetail_progressPhotos"), id: "photos" },
    { name: t("clientDetail_sessionLogs"), id: "logs" },
    { name: t("clientDetail_exercisePerformance"), id: "exercise" },
  ];

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
  };

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
    exercise: (
      <ManageClientExerciseLogs
        clientId={client.id}
        initialExerciseLogs={client.exerciseLogs}
      />
    ),
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
      <div className="p-2">
        <nav
          className="bg-neutral-200 dark:bg-neutral-800 rounded-lg p-1 flex justify-center overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
      <div
        className={`p-6 transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}
      >
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