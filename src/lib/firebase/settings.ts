import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, firebaseReady } from './config'
import type { BusinessSettings } from '@/types'

const SETTINGS_DOC_ID = 'business'

const DEFAULT_SETTINGS: Omit<BusinessSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  studioName: '',
  ownerName: '',
  phone: '',
  whatsapp: '',
  instagram: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  pixKey: '',
  logo: '',
  coverImage: '',
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  language: 'pt-BR',
  businessHours: {
    monday: { open: true, startTime: '09:00', endTime: '19:00' },
    tuesday: { open: true, startTime: '09:00', endTime: '19:00' },
    wednesday: { open: true, startTime: '09:00', endTime: '19:00' },
    thursday: { open: true, startTime: '09:00', endTime: '19:00' },
    friday: { open: true, startTime: '09:00', endTime: '19:00' },
    saturday: { open: true, startTime: '09:00', endTime: '15:00' },
    sunday: { open: false, startTime: '09:00', endTime: '19:00' },
  },
  breaks: [],
  dateBlocks: [],
  timeBlocks: [],
  paymentMethods: [
    { id: 'pix', enabled: true, label: 'PIX' },
    { id: 'card', enabled: true, label: 'Cartao' },
    { id: 'cash', enabled: true, label: 'Dinheiro' },
    { id: 'transfer', enabled: false, label: 'Transferencia' },
    { id: 'other', enabled: false, label: 'Outros' },
  ],
  policies: {
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    cancelBeforeHours: 24,
    rescheduleAllowed: true,
    confirmationMessage: 'Seu agendamento foi confirmado! Aguardamos voce.',
    cancellationMessage: 'Seu agendamento foi cancelado. Sentimos sua falta!',
  },
  preferences: {
    theme: 'light',
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
  },
}

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  if (!firebaseReady || !db) return null
  try {
    const ref = doc(db, 'settings', SETTINGS_DOC_ID)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as BusinessSettings
  } catch {
    return null
  }
}

export async function saveBusinessSettings(
  data: Partial<BusinessSettings>
): Promise<boolean> {
  if (!firebaseReady || !db) return false
  try {
    const ref = doc(db, 'settings', SETTINGS_DOC_ID)
    const now = new Date().toISOString()
    const snap = await getDoc(ref)
    const existing = snap.exists() ? (snap.data() as BusinessSettings) : null
    const payload = {
      ...DEFAULT_SETTINGS,
      ...existing,
      ...data,
      id: SETTINGS_DOC_ID,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }
    await setDoc(ref, payload)
    return true
  } catch {
    return false
  }
}

export async function initBusinessSettings(): Promise<boolean> {
  if (!firebaseReady || !db) return false
  try {
    const ref = doc(db, 'settings', SETTINGS_DOC_ID)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const now = new Date().toISOString()
      await setDoc(ref, {
        ...DEFAULT_SETTINGS,
        id: SETTINGS_DOC_ID,
        createdAt: now,
        updatedAt: now,
      })
    }
    return true
  } catch {
    return false
  }
}
