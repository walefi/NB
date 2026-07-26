import { useState, useEffect, useCallback } from 'react'
import {
  requestNotificationPermission,
  saveTokenToFirestore,
  removeTokenFromFirestore,
  initializeFCMForAdmin,
} from '@/lib/firebase/notification-service'
import { isFCMSupported } from '@/lib/firebase/messaging'
import { useAuth } from '@/contexts/AuthContext'

export function useFCM() {
  const { currentUser } = useAuth()
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(true)
  const [enabling, setEnabling] = useState(false)

  const enabled = permission === 'granted'

  useEffect(() => {
    const checkStatus = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }

      const isSupported = isFCMSupported()
      setSupported(isSupported)

      if (!isSupported) {
        setLoading(false)
        return
      }

      const status = await initializeFCMForAdmin()
      setPermission(status.permission)
      setLoading(false)
    }

    checkStatus()
  }, [currentUser])

  const enableNotifications = useCallback(async () => {
    if (!currentUser || enabling) return false
    setEnabling(true)

    try {
      const token = await requestNotificationPermission()
      if (token) {
        await saveTokenToFirestore(currentUser.uid, token)
        setPermission('granted')
        setEnabling(false)
        return true
      }
      setEnabling(false)
      return false
    } catch {
      setEnabling(false)
      return false
    }
  }, [currentUser, enabling])

  const disableNotifications = useCallback(async () => {
    if (!currentUser) return
    await removeTokenFromFirestore(currentUser.uid)
    setPermission('default')
  }, [currentUser])

  return {
    supported,
    permission,
    enabled,
    loading,
    enabling,
    enableNotifications,
    disableNotifications,
  }
}
