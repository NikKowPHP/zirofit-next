import React from "react";

type AtAGlanceStatsProps = {
  activeClients: number;
  sessionsThisMonth: number;
  pendingClients: number;
};

const AtAGlanceStats: React.FC<AtAGlanceStatsProps> = ({
  activeClients,
  sessionsThisMonth,
  pendingClients,
}) => {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        At a Glance
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-gray-600 dark:text-gray-400">
            Active Clients
          </span>
          <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {activeClients}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-gray-600 dark:text-gray-400">
            Sessions This Month
          </span>
          <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {sessionsThisMonth}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-gray-600 dark:text-gray-400">
            Pending Clients
          </span>
          <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {pendingClients}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AtAGlanceStats;
