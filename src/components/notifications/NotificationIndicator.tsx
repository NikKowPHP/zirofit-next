
"use client";

import { useState, useEffect, Fragment } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Notification } from "@/types/notifications";
import NotificationList from "./NotificationList";
import { createClient } from "@/lib/supabase/client";
import { Popover, Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";

export default function NotificationIndicator() {
  const t = useTranslations('Notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [_userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUserIdAndInitialNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Fetch initial count on page load
        fetchNotifications(true);
      }
    };
    getUserIdAndInitialNotifications();
  }, [supabase.auth]);

  const fetchNotifications = async (isInitialFetch = false) => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      if (!isInitialFetch) {
        setNotifications(data);
      }
      const unread = data.filter((n: Notification) => !n.readStatus).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <Popover className="relative">
      {({ open }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (open) {
            fetchNotifications();
          }
        }, [open]);

        return (
          <>
            <Popover.Button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700/50 relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              aria-label={t('toggle', { count: unreadCount })}
            >
              <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span
                  data-testid="notification-count"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
                  aria-live="polite"
                >
                  {unreadCount}
                </span>
              )}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-10 right-0 mt-2 w-80">
                {({ close }) => (
                  <NotificationList
                    notifications={notifications}
                    onClose={close}
                    onMarkRead={fetchNotifications}
                  />
                )}
              </Popover.Panel>
            </Transition>
          </>
        );
      }}
    </Popover>
  );
}