interface ActivityItem {
  type:
    | "UPCOMING_SESSION"
    | "NEW_MEASUREMENT"
    | "PROGRESS_PHOTO"
    | "PAST_SESSION";
  date: Date;
  clientName: string;
  message: string;
}

interface ActivityFeedProps {
  activityFeed: ActivityItem[];
}

export default function ActivityFeed({ activityFeed }: ActivityFeedProps) {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Activity Feed
      </h2>
      <div className="space-y-3">
        {activityFeed.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
        ) : (
          activityFeed.map((activity, index) => (
            <div
              key={index}
              className="p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-md"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {activity.date
                  ? new Date(activity.date).toLocaleDateString()
                  : ""}{" "}
                - {activity.message || ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
