interface ActivityItem {
  type: 'UPCOMING_SESSION' | 'NEW_MEASUREMENT' | 'PROGRESS_PHOTO' | 'PAST_SESSION';
  date: Date;
  clientName: string;
  message: string;
}

interface ActivityFeedProps {
  activityFeed: ActivityItem[];
}

export default function ActivityFeed({ activityFeed }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activityFeed.length === 0 ? (
        <p className="text-gray-500">No recent activity</p>
      ) : (
        activityFeed.map((activity, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600">
              {activity.date.toLocaleDateString()} - {activity.message}
            </p>
          </div>
        ))
      )}
    </div>
  );
}