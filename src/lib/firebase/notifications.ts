import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  where,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore'
import { db, firebaseReady } from './config'
import type { Notification, NotificationType } from '@/types'

const STORAGE_KEY = 'nb_notifications'

function getLocalNotifications(): Notification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalNotifications(notifications: Notification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

function mapNotifDoc(docData: DocumentData, id: string): Notification {
  const data = docData.data?.() ?? docData
  return {
    id,
    type: data.type ?? 'new_appointment',
    title: data.title ?? '',
    message: data.message ?? '',
    appointmentId: data.appointmentId ?? '',
    clientName: data.clientName ?? '',
    clientPhone: data.clientPhone ?? '',
    date: data.date ?? '',
    time: data.time ?? '',
    createdAt: data.createdAt ?? new Date().toISOString(),
    read: data.read ?? false,
  }
}

export interface CreateNotificationData {
  type: NotificationType
  title: string
  message: string
  appointmentId: string
  clientName: string
  clientPhone: string
  date: string
  time: string
}

export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const notification: Notification = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  }

  if (!firebaseReady || !db) {
    const all = getLocalNotifications()
    all.unshift(notification)
    saveLocalNotifications(all)
    return notification
  }

  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      type: data.type,
      title: data.title,
      message: data.message,
      appointmentId: data.appointmentId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      date: data.date,
      time: data.time,
      createdAt: new Date().toISOString(),
      read: false,
    })
    return { ...notification, id: docRef.id }
  } catch {
    const all = getLocalNotifications()
    all.unshift(notification)
    saveLocalNotifications(all)
    return notification
  }
}

export async function markAsRead(id: string): Promise<void> {
  if (!firebaseReady || !db) {
    const all = getLocalNotifications()
    const idx = all.findIndex((n) => n.id === id)
    if (idx !== -1) {
      all[idx].read = true
      saveLocalNotifications(all)
    }
    return
  }

  try {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  } catch {
    const all = getLocalNotifications()
    const idx = all.findIndex((n) => n.id === id)
    if (idx !== -1) {
      all[idx].read = true
      saveLocalNotifications(all)
    }
  }
}

export async function markAllAsRead(): Promise<void> {
  if (!firebaseReady || !db) {
    const all = getLocalNotifications().map((n) => ({ ...n, read: true }))
    saveLocalNotifications(all)
    return
  }

  try {
    const q = query(collection(db, 'notifications'), where('read', '==', false))
    const snapshot = await getDocs(q)
    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { read: true })
    })
    await batch.commit()
  } catch {
    const all = getLocalNotifications().map((n) => ({ ...n, read: true }))
    saveLocalNotifications(all)
  }
}

export async function deleteNotification(id: string): Promise<void> {
  if (!firebaseReady || !db) {
    const all = getLocalNotifications().filter((n) => n.id !== id)
    saveLocalNotifications(all)
    return
  }

  try {
    await deleteDoc(doc(db, 'notifications', id))
  } catch {
    const all = getLocalNotifications().filter((n) => n.id !== id)
    saveLocalNotifications(all)
  }
}

export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void
): () => void {
  if (!firebaseReady || !db) {
    callback(getLocalNotifications())
    return () => {}
  }

  const q = query(
    collection(db, 'notifications'),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => mapNotifDoc(d, d.id))
    callback(data)
  }, () => {
    callback(getLocalNotifications())
  })

  return unsubscribe
}

export function generateNotificationTitle(type: NotificationType): string {
  switch (type) {
    case 'new_appointment': return 'Novo Agendamento'
    case 'confirmed': return 'Agendamento Confirmado'
    case 'cancelled': return 'Agendamento Cancelado'
    case 'rescheduled': return 'Agendamento Reagendado'
    case 'completed': return 'Atendimento Finalizado'
    case 'reminder_24h': return 'Lembrete - 24h'
    case 'reminder_2h': return 'Lembrete - 2h'
    case 'reminder_30min': return 'Lembrete - 30min'
    default: return 'Notificacao'
  }
}
