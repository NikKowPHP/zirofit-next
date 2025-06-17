"use client"

import { useState, useEffect } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { Notification } from '@/types/notifications'
import NotificationList from './NotificationList'
import { createClient } from '@/lib/supabase/client'

export default function NotificationIndicator() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUserId()
  }, [supabase.auth])

  useEffect(() => {
    if (!userId) return

    fetchNotifications()
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`)

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'auth',
        userId: userId
      }))
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'notification') {
        setNotifications(prev => [message.data, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      ws.close()
    }

    return () => {
      ws.close()
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      
      const data = await response.json()
      setNotifications(data)
      
      const unread = data.filter((n: Notification) => !n.readStatus).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen)
          fetchNotifications()
        }}
        className="p-2 rounded-full hover:bg-gray-100 relative"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span data-testid="notification-count" className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        <span className="sr-only">{unreadCount} unread notifications</span>
      </button>

      {isOpen && (
        <NotificationList 
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkRead={fetchNotifications}
        />
      )}
    </div>
  )
}