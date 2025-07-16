
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useLocale } from "next-intl";

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
  const locale = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
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
                    ? new Date(activity.date).toLocaleDateString(locale)
                    : ""}{" "}
                  - {activity.message || ""}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}