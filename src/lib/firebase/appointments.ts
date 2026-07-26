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
import { createNotification } from './notifications'
import { APPOINTMENT_STATUS, type AppointmentStatus } from '@/constants/appointment-status'
import type { Appointment } from '@/types'

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function hasOverlap(
  date: string,
  time: string,
  serviceDuration: number,
  appointments: Appointment[]
): boolean {
  const newStart = timeToMinutes(time)
  const newEnd = newStart + serviceDuration
  return appointments.some((a) => {
    if (a.date !== date) return false
    if (a.status !== APPOINTMENT_STATUS.CONFIRMED && a.status !== APPOINTMENT_STATUS.COMPLETED) return false
    const aStart = timeToMinutes(a.time)
    const aEnd = aStart + a.serviceDuration
    return newStart < aEnd && newEnd > aStart
  })
}

async function fetchAppointmentsForDate(date: string): Promise<Appointment[]> {
  if (!firebaseReady || !db) return []
  try {
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', date),
      orderBy('time', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => mapApptDoc(d, d.id))
  } catch {
    return []
  }
}

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
    status: data.status ?? APPOINTMENT_STATUS.CONFIRMED,
    createdAt: data.createdAt ?? new Date().toISOString(),
  }
}

export async function checkSlotAvailability(
  date: string,
  time: string,
  serviceDuration: number = 60
): Promise<{ available: boolean; existingId?: string }> {
  const all = await fetchAppointmentsForDate(date)
  const conflict = all.find((a) => hasOverlap(date, time, serviceDuration, [a]))
  if (conflict) return { available: false, existingId: conflict.id }
  return { available: true }
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'status' | 'createdAt'>
): Promise<Appointment> {
  const availability = await checkSlotAvailability(data.date, data.time, data.serviceDuration)
  if (!availability.available) {
    throw new AppointmentsError(
      'Este horario acabou de ser reservado. Por favor, escolha outro horario.',
      'SLOT_TAKEN'
    )
  }

  const appointment: Appointment = {
    ...data,
    id: crypto.randomUUID(),
    status: APPOINTMENT_STATUS.CONFIRMED,
    createdAt: new Date().toISOString(),
  }

  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    if (hasOverlap(data.date, data.time, data.serviceDuration, all)) {
      throw new AppointmentsError(
        'Este horario acabou de ser reservado. Por favor, escolha outro horario.',
        'SLOT_TAKEN'
      )
    }
    all.push(appointment)
    saveLocalAppointments(all)

    const days = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado']
    const [, month, day] = data.date.split('-').map(Number)
    const dateObj = new Date(new Date().getFullYear(), month - 1, day)
    const dayName = days[dateObj.getDay()]

    createNotification({
      type: 'new_appointment',
      title: 'Novo Agendamento',
      message: `${data.clientName} acabou de agendar ${data.serviceName} para ${dayName} as ${data.time}.`,
      appointmentId: appointment.id,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      serviceName: data.serviceName,
      date: data.date,
      time: data.time,
    }).catch(() => {})

    return appointment
  }

  try {
    const freshCheck = await checkSlotAvailability(data.date, data.time, data.serviceDuration)
    if (!freshCheck.available) {
      throw new AppointmentsError(
        'Este horario acabou de ser reservado. Por favor, escolha outro horario.',
        'SLOT_TAKEN'
      )
    }

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
    status: APPOINTMENT_STATUS.CONFIRMED,
      createdAt: new Date().toISOString(),
    })

    const days = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado']
    const [, month, day] = data.date.split('-').map(Number)
    const dateObj = new Date(new Date().getFullYear(), month - 1, day)
    const dayName = days[dateObj.getDay()]

    createNotification({
      type: 'new_appointment',
      title: 'Novo Agendamento',
      message: `${data.clientName} acabou de agendar ${data.serviceName} para ${dayName} as ${data.time}.`,
      appointmentId: docRef.id,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      serviceName: data.serviceName,
      date: data.date,
      time: data.time,
    }).catch(() => {})

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

const STATUS_NOTIFICATIONS: Record<string, { title: string; message: (name: string, service: string, date: string, time: string) => string } | null> = {
  confirmed: {
    title: 'Agendamento Confirmado',
    message: (name, service, date, time) => `Agendamento de ${name} (${service}) confirmado para ${date} as ${time}.`,
  },
  cancelled: {
    title: 'Agendamento Cancelado',
    message: (name, service) => `${name} cancelou o atendimento de ${service}.`,
  },
  completed: {
    title: 'Atendimento Finalizado',
    message: (name, service) => `Atendimento de ${name} (${service}) finalizado.`,
  },
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  appointmentData?: { clientName: string; clientPhone: string; serviceName: string; date: string; time: string }
): Promise<void> {
  const notifConfig = STATUS_NOTIFICATIONS[status]

  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].status = status
      saveLocalAppointments(all)

      if (notifConfig && appointmentData) {
        createNotification({
          type: status === APPOINTMENT_STATUS.CONFIRMED ? 'confirmed' : status === APPOINTMENT_STATUS.CANCELLED ? 'cancelled' : 'completed',
          title: notifConfig.title,
          message: notifConfig.message(
            appointmentData.clientName,
            appointmentData.serviceName,
            appointmentData.date,
            appointmentData.time
          ),
          appointmentId: id,
          clientName: appointmentData.clientName,
          clientPhone: appointmentData.clientPhone,
          serviceName: appointmentData.serviceName,
          date: appointmentData.date,
          time: appointmentData.time,
        }).catch(() => {})
      }
    }
    return
  }

  try {
    await updateDoc(doc(db, 'appointments', id), { status })

    if (notifConfig && appointmentData) {
      createNotification({
        type: status === APPOINTMENT_STATUS.CONFIRMED ? 'confirmed' : status === APPOINTMENT_STATUS.CANCELLED ? 'cancelled' : 'completed',
        title: notifConfig.title,
        message: notifConfig.message(
          appointmentData.clientName,
          appointmentData.serviceName,
          appointmentData.date,
          appointmentData.time
        ),
        appointmentId: id,
        clientName: appointmentData.clientName,
        clientPhone: appointmentData.clientPhone,
        serviceName: appointmentData.serviceName,
        date: appointmentData.date,
        time: appointmentData.time,
      }).catch(() => {})
    }
  } catch {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].status = status
      saveLocalAppointments(all)
    }
  }
}

export async function rescheduleAppointment(
  id: string,
  newDate: string,
  newTime: string,
  appointmentData?: { clientName: string; clientPhone: string; serviceName: string; date: string; time: string; serviceDuration?: number }
): Promise<void> {
  const duration = appointmentData?.serviceDuration ?? 60
  const availability = await checkSlotAvailability(newDate, newTime, duration)
  if (!availability.available && availability.existingId !== id) {
    throw new AppointmentsError(
      'Este horario acabou de ser reservado. Por favor, escolha outro horario.',
      'SLOT_TAKEN'
    )
  }

  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].date = newDate
      all[idx].time = newTime
      saveLocalAppointments(all)

      createNotification({
        type: 'rescheduled',
        title: 'Agendamento Reagendado',
        message: `${appointmentData?.clientName || 'Cliente'} reagendado de ${appointmentData?.date} ${appointmentData?.time} para ${newDate} ${newTime}.`,
        appointmentId: id,
        clientName: appointmentData?.clientName || '',
        clientPhone: appointmentData?.clientPhone || '',
        serviceName: appointmentData?.serviceName || '',
        date: newDate,
        time: newTime,
      }).catch(() => {})
    }
    return
  }

  try {
    await updateDoc(doc(db, 'appointments', id), { date: newDate, time: newTime })

    createNotification({
      type: 'rescheduled',
      title: 'Agendamento Reagendado',
      message: `${appointmentData?.clientName || 'Cliente'} reagendado de ${appointmentData?.date} ${appointmentData?.time} para ${newDate} ${newTime}.`,
      appointmentId: id,
      clientName: appointmentData?.clientName || '',
      clientPhone: appointmentData?.clientPhone || '',
      serviceName: appointmentData?.serviceName || '',
      date: newDate,
      time: newTime,
    }).catch(() => {})
  } catch {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].date = newDate
      all[idx].time = newTime
      saveLocalAppointments(all)
    }
  }
}

export async function moveAppointment(
  id: string,
  newDate: string,
  newTime: string
): Promise<void> {
  if (!firebaseReady || !db) {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].date = newDate
      all[idx].time = newTime
      saveLocalAppointments(all)
    }
    return
  }

  try {
    await updateDoc(doc(db, 'appointments', id), { date: newDate, time: newTime })
  } catch {
    const all = getLocalAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx !== -1) {
      all[idx].date = newDate
      all[idx].time = newTime
      saveLocalAppointments(all)
    }
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  if (!firebaseReady || !db) {
    const all = getLocalAppointments().filter((a) => a.id !== id)
    saveLocalAppointments(all)
    return
  }

  try {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'appointments', id))
  } catch {
    const all = getLocalAppointments().filter((a) => a.id !== id)
    saveLocalAppointments(all)
  }
}
