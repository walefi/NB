import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { subscribeToNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/lib/firebase/notifications'
import { playNotificationSound } from '@/lib/admin/notification-sound'
import type { Notification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const prevCountRef = useRef(0)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToNotifications((data) => {
      if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
        playNotificationSound()
      }
      prevCountRef.current = data.length
      setNotifications(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const todayNotifications = useMemo(() => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return notifications.filter((n) => n.createdAt.split('T')[0] === today)
  }, [notifications])

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.read)
  }, [notifications])

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsRead(id)
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    await deleteNotification(id)
  }, [])

  return {
    notifications,
    loading,
    unreadCount,
    todayNotifications,
    unreadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
  }
}
