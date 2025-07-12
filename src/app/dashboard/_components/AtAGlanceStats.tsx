import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

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
    <Card>
      <CardHeader>
        <CardTitle>At a Glance</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default AtAGlanceStats;