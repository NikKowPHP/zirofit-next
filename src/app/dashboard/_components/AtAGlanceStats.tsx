import React from 'react';

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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">At a Glance</h2>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Active Clients:</span> {activeClients}
        </div>
        <div>
          <span className="font-semibold">Sessions This Month:</span> {sessionsThisMonth}
        </div>
        <div>
          <span className="font-semibold">Pending Clients:</span> {pendingClients}
        </div>
      </div>
    </div>
  );
};

export default AtAGlanceStats;