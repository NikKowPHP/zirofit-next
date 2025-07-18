
"use client";

import { Notification } from "@/types/notifications";
import { formatDistanceToNow } from "date-fns";
import { enUS, pl } from "date-fns/locale";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: () => void;
}

export default function NotificationList({
  notifications,
  onClose,
  onMarkRead,
}: NotificationListProps) {
  const t = useTranslations('Notifications');
  const locale = useLocale();
  const fnsLocale = locale === 'pl' ? pl : enUS;

  const handleMarkRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });
      onMarkRead();
    } catch (error) {
      console.error(t('markReadError'), error);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
        <h3 className="font-semibold">{t('title')}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">{t('noNotifications')}</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleMarkRead(notification.id)}
              className={`text-neutral-900 dark:text-neutral-50 p-4 border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 cursor-pointer ${
                !notification.readStatus ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: fnsLocale,
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}