"use client"

import { Notification } from '@/types/notifications'
import { formatDistanceToNow } from 'date-fns'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NotificationListProps {
  notifications: Notification[]
  onClose: () => void
  onMarkRead: () => void
}

export default function NotificationList({ 
  notifications, 
  onClose,
  onMarkRead
}: NotificationListProps) {
  const handleMarkRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })

      if (!response.ok) throw new Error('Failed to mark notification as read')
      
      onMarkRead()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleMarkRead(notification.id)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.readStatus ? 'bg-blue-50' : ''
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}