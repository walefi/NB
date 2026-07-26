import { getToken } from 'firebase/messaging'
import { doc, setDoc, deleteDoc, getFirestore, serverTimestamp } from 'firebase/firestore'
import { getFirebaseMessaging, isFCMSupported } from './messaging'
import { auth, firebaseReady } from './config'

const VITE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

function getDeviceInfo(): { device: string; browser: string } {
  const ua = navigator.userAgent
  let device = 'Desktop'
  if (/Android|iPhone|iPad|iPod/i.test(ua)) device = 'Mobile'
  else if (/iPad/i.test(ua)) device = 'Tablet'

  let browser = 'Unknown'
  if (/Edg/i.test(ua)) browser = 'Edge'
  else if (/Chrome/i.test(ua)) browser = 'Chrome'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Safari/i.test(ua)) browser = 'Safari'

  return { device, browser }
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!isFCMSupported()) return null
  if (!VITE_VAPID_KEY) {
    console.warn('VITE_FIREBASE_VAPID_KEY not configured')
    return null
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const messaging = getFirebaseMessaging()
  if (!messaging) return null

  try {
    const token = await getToken(messaging, { vapidKey: VITE_VAPID_KEY })
    return token
  } catch (err) {
    console.error('Failed to get FCM token:', err)
    return null
  }
}

export async function saveTokenToFirestore(uid: string, token: string): Promise<void> {
  if (!firebaseReady) return
  const db = getFirestore()
  const { device, browser } = getDeviceInfo()

  const tokenRef = doc(db, 'adminTokens', uid)
  await setDoc(tokenRef, {
    uid,
    token,
    device,
    browser,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function removeTokenFromFirestore(uid: string): Promise<void> {
  if (!firebaseReady) return
  const db = getFirestore()
  const tokenRef = doc(db, 'adminTokens', uid)
  await deleteDoc(tokenRef)
}

export async function getCurrentToken(): Promise<string | null> {
  const messaging = getFirebaseMessaging()
  if (!messaging) return null

  try {
    const token = await getToken(messaging)
    return token
  } catch {
    return null
  }
}

export async function initializeFCMForAdmin(): Promise<{
  token: string | null
  permission: NotificationPermission
  supported: boolean
}> {
  const supported = isFCMSupported()
  if (!supported) return { token: null, permission: 'denied', supported: false }

  const permission = Notification.permission
  if (permission !== 'granted') return { token: null, permission, supported: true }

  const token = await getCurrentToken()
  if (token && auth?.currentUser) {
    await saveTokenToFirestore(auth.currentUser.uid, token)
  }

  return { token, permission, supported: true }
}
