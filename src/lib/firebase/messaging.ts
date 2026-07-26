import { messaging, firebaseReady } from './config'

export function getFirebaseMessaging() {
  if (!firebaseReady || !messaging) return null
  return messaging
}

export function isFCMSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}
