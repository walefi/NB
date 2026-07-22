import * as admin from 'firebase-admin'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { sendWhatsAppNotification, processRetryQueue } from './notifications/service'

admin.initializeApp()

interface AppointmentDoc {
  id: string
  clientName: string
  clientPhone: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  date: string
  time: string
  status: string
  paymentMethod: string
  notes?: string
  createdAt: string
}

function extractAppointment(docData: Record<string, unknown>, id: string): AppointmentDoc {
  return {
    id,
    clientName: (docData.clientName as string) || '',
    clientPhone: (docData.clientPhone as string) || '',
    serviceName: (docData.serviceName as string) || '',
    servicePrice: (docData.servicePrice as number) || 0,
    serviceDuration: (docData.serviceDuration as number) || 60,
    date: (docData.date as string) || '',
    time: (docData.time as string) || '',
    status: (docData.status as string) || 'pending',
    paymentMethod: (docData.paymentMethod as string) || 'to_combine',
    notes: (docData.notes as string) || undefined,
    createdAt: (docData.createdAt as string) || new Date().toISOString(),
  }
}

// Novo agendamento -> envia WhatsApp pro estúdio
export const onAppointmentCreated = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const snap = event.data
    if (!snap) return
    const data = snap.data()
    if (!data) return

    const appointment = extractAppointment(data as Record<string, unknown>, event.params.appointmentId)
    console.log(`New appointment: ${appointment.id} from ${appointment.clientName}`)

    await sendWhatsAppNotification(appointment, 'new_appointment')
  }
)

// Status mudou -> envia WhatsApp pro cliente
export const onAppointmentStatusChanged = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return

    const oldStatus = before.status as string
    const newStatus = after.status as string

    if (oldStatus === newStatus) return

    const appointment = extractAppointment(
      after as Record<string, unknown>,
      event.params.appointmentId
    )

    console.log(`Status changed: ${appointment.id} from ${oldStatus} to ${newStatus}`)

    switch (newStatus) {
      case 'confirmed':
        await sendWhatsAppNotification(appointment, 'confirmed')
        break
      case 'cancelled':
        await sendWhatsAppNotification(appointment, 'cancelled')
        break
      case 'completed':
        // No WhatsApp for completed
        break
    }

    // Check if date/time changed (reschedule)
    const oldDate = before.date as string
    const oldTime = before.time as string
    if (appointment.date !== oldDate || appointment.time !== oldTime) {
      await sendWhatsAppNotification(appointment, 'rescheduled', {
        newDate: appointment.date,
        newTime: appointment.time,
      })
    }
  }
)

// Lembretes: roda a cada 30 minutos
export const sendReminders = onSchedule('every 30 minutes', async () => {
  const db = admin.firestore()
  const now = new Date()

  // Lembrete 24h
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const snapshot24h = await db
    .collection('appointments')
    .where('date', '==', tomorrowStr)
    .where('status', 'in', ['confirmed', 'pending'])
    .get()

  for (const doc of snapshot24h.docs) {
    const data = doc.data()
    const appointment = extractAppointment(data as Record<string, unknown>, doc.id)

    const alreadySent = await db
      .collection('notification_logs')
      .where('appointmentId', '==', doc.id)
      .where('type', '==', 'reminder_24h')
      .limit(1)
      .get()

    if (alreadySent.empty) {
      await sendWhatsAppNotification(appointment, 'reminder_24h')
    }
  }

  // Lembrete 2h
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const twoHoursTime = `${twoHoursLater.getHours().toString().padStart(2, '0')}:${twoHoursLater.getMinutes().toString().padStart(2, '0')}`
  const todayStr = now.toISOString().split('T')[0]

  const snapshot2h = await db
    .collection('appointments')
    .where('date', '==', todayStr)
    .where('status', 'in', ['confirmed', 'pending'])
    .get()

  for (const doc of snapshot2h.docs) {
    const data = doc.data()
    const aptTime = data.time as string

    if (aptTime >= twoHoursTime && aptTime <= `${twoHoursLater.getHours().toString().padStart(2, '0')}:${(twoHoursLater.getMinutes() + 30).toString().padStart(2, '0')}`) {
      const appointment = extractAppointment(data as Record<string, unknown>, doc.id)

      const alreadySent = await db
        .collection('notification_logs')
        .where('appointmentId', '==', doc.id)
        .where('type', '==', 'reminder_2h')
        .limit(1)
        .get()

      if (alreadySent.empty) {
        await sendWhatsAppNotification(appointment, 'reminder_2h')
      }
    }
  }

  // Lembrete 30min
  const thirtyMinLater = new Date(now.getTime() + 30 * 60 * 1000)
  const thirtyMinTime = `${thirtyMinLater.getHours().toString().padStart(2, '0')}:${thirtyMinLater.getMinutes().toString().padStart(2, '0')}`

  for (const doc of snapshot2h.docs) {
    const data = doc.data()
    const aptTime = data.time as string

    if (aptTime >= thirtyMinTime && aptTime <= `${thirtyMinLater.getHours().toString().padStart(2, '0')}:${(thirtyMinLater.getMinutes() + 30).toString().padStart(2, '0')}`) {
      const appointment = extractAppointment(data as Record<string, unknown>, doc.id)

      const alreadySent = await db
        .collection('notification_logs')
        .where('appointmentId', '==', doc.id)
        .where('type', '==', 'reminder_30min')
        .limit(1)
        .get()

      if (alreadySent.empty) {
        await sendWhatsAppNotification(appointment, 'reminder_30min')
      }
    }
  }
})

// Processar fila de retry: roda a cada 5 minutos
export const processRetryNotifications = onSchedule('every 5 minutes', async () => {
  await processRetryQueue()
})
