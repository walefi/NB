import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

function allEnvVarsPresent(): boolean {
  return requiredEnvVars.every((key) => {
    const value = import.meta.env[key]
    return typeof value === 'string' && value.length > 0
  })
}

const isConfigured = allEnvVarsPresent()

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app: FirebaseApp
let db: Firestore | null = null
let auth: Auth | null = null
let storage: FirebaseStorage | null = null
let firebaseReady = false
let initError: string | null = null

try {
  if (isConfigured) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    firebaseReady = true
  }
} catch (err) {
  initError = err instanceof Error ? err.message : 'Erro ao inicializar Firebase'
  firebaseReady = false
}

export { app, db, auth, storage, firebaseReady, isConfigured, initError }
