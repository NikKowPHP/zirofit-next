"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Notification } from "@/types/notifications";
import NotificationList from "./NotificationList";
import { createClient } from "@/lib/supabase/client";

export default function NotificationIndicator() {
  const [isOpen, setIsOpen] = useState(false);
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
      // Only update the full list when the dropdown is open
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
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Fetch fresh data when opening the list
            fetchNotifications();
          }
        }}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700/50 relative transition-colors"
        aria-label={`Toggle notifications. ${unreadCount} unread.`}
        aria-haspopup="true"
        aria-expanded={isOpen}
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
      </button>

      {isOpen && (
        <NotificationList
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkRead={fetchNotifications}
        />
      )}
    </div>
  );
}
