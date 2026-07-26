/* eslint-disable no-undef */
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: __FIREBASE_API_KEY__,
  authDomain: __FIREBASE_AUTH_DOMAIN__,
  projectId: __FIREBASE_PROJECT_ID__,
  storageBucket: __FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
  appId: __FIREBASE_APP_ID__,
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

onBackgroundMessage(messaging, (payload) => {
  const title = payload.notification?.title || 'NB Nail'
  const body = payload.notification?.body || ''
  const icon = '/favicon.svg'

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/favicon.svg',
    tag: payload.data?.appointmentId || 'general',
    renotify: true,
  })
})
