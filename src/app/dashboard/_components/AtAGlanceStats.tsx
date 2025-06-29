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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        At a Glance
      </h2>
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <div>
          <span className="font-semibold">Active Clients:</span> {activeClients}
        </div>
        <div>
          <span className="font-semibold">Sessions This Month:</span>{" "}
          {sessionsThisMonth}
        </div>
        <div>
          <span className="font-semibold">Pending Clients:</span>{" "}
          {pendingClients}
        </div>
      </div>
    </div>
  );
};

export default AtAGlanceStats;
