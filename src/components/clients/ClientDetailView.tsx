"use client";

import { useState, Suspense } from 'react';
import type { Client, ClientSessionLog } from '../../generated/prisma';
import { PrismaClient } from '@/generated/prisma';
import ManageClientMeasurements from './modules/ManageClientMeasurements';
import ManageClientProgressPhotos from './modules/ManageClientProgressPhotos';
import ManageClientSessionLogs from './modules/ManageClientSessionLogs';
import ClientStatisticsComponent from './modules/ClientStatistics';

// Prop type including relations
type ClientWithDetails = Client & {
  measurements: PrismaClient["clientMeasurement"][];
  progressPhotos: PrismaClient["clientProgressPhoto"][];
  sessionLogs: ClientSessionLog[];
};

interface ClientDetailViewProps {
  client: ClientWithDetails;
}

const ClientStatistics = ({ measurements }: { measurements: PrismaClient["clientMeasurement"][] }) => <ClientStatisticsComponent measurements={measurements} />;

const tabs = [
  { name: 'Statistics', id: 'stats' },
  { name: 'Measurements', id: 'measurements' },
  { name: 'Progress Photos', id: 'photos' },
  { name: 'Session Logs', id: 'logs' },
];

export default function ClientDetailView({ client }: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState('stats');

  const renderContent = () => {
    switch (activeTab) {
      case 'measurements':
        return <ManageClientMeasurements clientId={client.id} initialMeasurements={client.measurements} />;
      case 'photos':
        return <ManageClientProgressPhotos clientId={client.id} initialProgressPhotos={client.progressPhotos} />;
      case 'logs':
        return <ManageClientSessionLogs clientId={client.id} initialSessionLogs={client.sessionLogs} />;
      case 'stats':
      default:
        return <ClientStatistics measurements={client.measurements} />;
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                tab.id === activeTab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        <Suspense fallback={<div>Loading...</div>}>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
}