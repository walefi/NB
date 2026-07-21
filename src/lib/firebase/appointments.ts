import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  type DocumentData,
  type FirestoreError,
} from 'firebase/firestore'
import { db, firebaseReady } from './config'
import type { Appointment, AppointmentStatus } from '@/types'

const STORAGE_KEY = 'nb_appointments'

export class AppointmentsError extends Error {
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'AppointmentsError'
    this.code = code
  }
}

function getLocalAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalAppointments(appointments: Appointment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
}

function mapApptDoc(doc: DocumentData, id: string): Appointment {
  const data = doc.data?.() ?? doc
  return {
    id,
    serviceId: data.serviceId ?? '',
    serviceName: data.serviceName ?? '',
    servicePrice: data.servicePrice ?? 0,
    serviceDuration: data.serviceDuration ?? 60,
    clientName: data.clientName ?? '',
    clientPhone: data.clientPhone ?? '',
    date: data.date ?? '',
    time: data.time ?? '',
    paymentMethod: data.paymentMethod ?? 'to_combine',
    notes: data.notes ?? undefined,
    status: data.status ?? 'pending',
    createdAt: data.createdAt ?? new Date().toISOString(),
  }
}

export async function checkSlotAvailability(
  date: string,
  time: string
): Promise<{ available: boolean; existingId?: string }> {
  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    const conflict = all.find(
      (a) => a.date === date && a.time === time && a.status !== 'cancelled'
    )
    return conflict
      ? { available: false, existingId: conflict.id }
      : { available: true }
  }

  try {
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', date),
      where('time', '==', time),
      where('status', '!=', 'cancelled')
    )
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      return { available: false, existingId: snapshot.docs[0].id }
    }
    return { available: true }
  } catch {
    const all = getLocalAppointments()
    const conflict = all.find(
      (a) => a.date === date && a.time === time && a.status !== 'cancelled'
    )
    return conflict
      ? { available: false, existingId: conflict.id }
      : { available: true }
  }
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'status' | 'createdAt'>
): Promise<Appointment> {
  const availability = await checkSlotAvailability(data.date, data.time)
  if (!availability.available) {
    throw new AppointmentsError(
      'Este horario ja esta reservado. Por favor, escolha outro horario.',
      'slot-unavailable'
    )
  }

  const appointment: Appointment = {
    ...data,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    // double-check locally
    const localConflict = all.find(
      (a) => a.date === data.date && a.time === data.time && a.status !== 'cancelled'
    )
    if (localConflict) {
      throw new AppointmentsError(
        'Este horario ja esta reservado. Por favor, escolha outro horario.',
        'slot-unavailable'
      )
    }
    all.push(appointment)
    saveLocalAppointments(all)
    return appointment
  }

  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      servicePrice: data.servicePrice,
      serviceDuration: data.serviceDuration,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      date: data.date,
      time: data.time,
      paymentMethod: data.paymentMethod,
      notes: data.notes ?? null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    return { ...appointment, id: docRef.id }
  } catch (err) {
    const firestoreErr = err as FirestoreError
    if (firestoreErr?.code === 'permission-denied') {
      throw new AppointmentsError(
        'Erro de permissao ao salvar. Verifique as regras do Firestore.',
        'permission-denied'
      )
    }
    throw new AppointmentsError(
      'Erro ao salvar agendamento. Tente novamente.',
      'save-failed'
    )
  }
}

export async function fetchAppointments(
  dateFilter?: string
): Promise<Appointment[]> {
  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    if (dateFilter) return all.filter((a) => a.date === dateFilter)
    return all.sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    )
  }

  try {
    let q
    if (dateFilter) {
      q = query(
        collection(db, 'appointments'),
        where('date', '==', dateFilter),
        orderBy('time', 'asc')
      )
    } else {
      q = query(
        collection(db, 'appointments'),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      )
    }
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => mapApptDoc(d, d.id))
  } catch {
    const all = getLocalAppointments()
    if (dateFilter) return all.filter((a) => a.date === dateFilter)
    return all.sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    )
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].status = status
      saveLocalAppointments(all)
    }
    return
  }

  try {
    await updateDoc(doc(db, 'appointments', id), { status })
  } catch {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].status = status
      saveLocalAppointments(all)
    }
  }
}
