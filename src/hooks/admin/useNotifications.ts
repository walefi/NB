import { useState, useEffect, useMemo, useCallback } from 'react'
import { subscribeToNotifications, markAsRead, markAllAsRead, deleteNotification } from '@/lib/firebase/notifications'
import type { Notification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToNotifications((data) => {
      setNotifications(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const todayNotifications = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
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
