import * as admin from 'firebase-admin'
import { sendWhatsAppText, logNotification } from './whatsapp'

interface AppointmentData {
  id: string
  clientName: string
  clientPhone: string
  serviceName: string
  servicePrice: number
  date: string
  time: string
  status: string
}

function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
}

function getDayName(dateStr: string): string {
  const days = [
    'Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sabado',
  ]
  const d = new Date(dateStr + 'T12:00:00')
  return days[d.getDay()]
}

const MESSAGES = {
  new_appointment: (apt: AppointmentData) =>
    `Novo agendamento!\n\n` +
    `Cliente: ${apt.clientName}\n` +
    `Servico: ${apt.serviceName}\n` +
    `Data: ${getDayName(apt.date)}, ${formatDateBR(apt.date)}\n` +
    `Horario: ${apt.time}\n` +
    `Telefone: ${apt.clientPhone}`,

  confirmed: (apt: AppointmentData) =>
    `Seu horario foi confirmado!\n\n` +
    `Cliente: ${apt.clientName}\n` +
    `Servico: ${apt.serviceName}\n` +
    `Data: ${getDayName(apt.date)}, ${formatDateBR(apt.date)}\n` +
    `Horario: ${apt.time}`,

  cancelled: (apt: AppointmentData) =>
    `Seu agendamento foi cancelado.\n\n` +
    `Cliente: ${apt.clientName}\n` +
    `Servico: ${apt.serviceName}\n` +
    `Data: ${getDayName(apt.date)}, ${formatDateBR(apt.date)}\n` +
    `Horario: ${apt.time}`,

  rescheduled: (apt: AppointmentData, newDate?: string, newTime?: string) =>
    `Seu agendamento foi reagendado.\n\n` +
    `Cliente: ${apt.clientName}\n` +
    `Servico: ${apt.serviceName}\n` +
    `Novo horario: ${newDate ? getDayName(newDate) + ', ' + formatDateBR(newDate) : apt.date} as ${newTime || apt.time}`,

  reminder_24h: (apt: AppointmentData) =>
    `Lembrete: Voce tem um agendamento amanha!\n\n` +
    `Servico: ${apt.serviceName}\n` +
    `Data: ${formatDateBR(apt.date)}\n` +
    `Horario: ${apt.time}`,

  reminder_2h: (apt: AppointmentData) =>
    `Lembrete: Seu agendamento e em 2 horas!\n\n` +
    `Servico: ${apt.serviceName}\n` +
    `Horario: ${apt.time}`,

  reminder_30min: (apt: AppointmentData) =>
    `Lembrete: Seu agendamento e em 30 minutos!\n\n` +
    `Servico: ${apt.serviceName}\n` +
    `Horario: ${apt.time}`,
}

export type MessageType = keyof typeof MESSAGES

export async function sendWhatsAppNotification(
  appointment: AppointmentData,
  type: MessageType,
  extra?: { newDate?: string; newTime?: string }
): Promise<boolean> {
  if (!appointment.clientPhone) {
    console.warn(`No phone for appointment ${appointment.id}, skipping WhatsApp`)
    return false
  }

  const messageFn = MESSAGES[type]
  if (!messageFn) {
    console.warn(`Unknown message type: ${type}`)
    return false
  }

  let message: string
  if (type === 'rescheduled') {
    message = (MESSAGES.rescheduled as (apt: AppointmentData, newDate?: string, newTime?: string) => string)(
      appointment,
      extra?.newDate,
      extra?.newTime
    )
  } else {
    message = (messageFn as (apt: AppointmentData) => string)(appointment)
  }

  const result = await sendWhatsAppText(appointment.clientPhone, message)

  await logNotification({
    provider: 'meta_whatsapp',
    status: result.success ? 'sent' : 'failed',
    appointmentId: appointment.id,
    phone: appointment.clientPhone,
    messageId: result.messageId,
    error: result.error,
    type,
  })

  if (!result.success) {
    console.error(`WhatsApp failed for ${type}:`, result.error)
    await queueRetry(appointment, type, extra)
  }

  return result.success
}

async function queueRetry(
  appointment: AppointmentData,
  type: MessageType,
  extra?: { newDate?: string; newTime?: string }
): Promise<void> {
  const db = admin.firestore()
  await db.collection('notification_queue').add({
    appointmentId: appointment.id,
    appointmentData: appointment,
    type,
    extra: extra || null,
    retries: 0,
    maxRetries: 3,
    nextRetryAt: new Date(Date.now() + 60000).toISOString(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
}

export async function processRetryQueue(): Promise<void> {
  const db = admin.firestore()
  const now = new Date().toISOString()

  const snapshot = await db
    .collection('notification_queue')
    .where('nextRetryAt', '<=', now)
    .where('status', '!=', 'completed')
    .limit(10)
    .get()

  for (const doc of snapshot.docs) {
    const job = doc.data()
    if (job.retries >= job.maxRetries) {
      await doc.ref.update({ status: 'failed', failedAt: admin.firestore.FieldValue.serverTimestamp() })
      continue
    }

    const success = await sendWhatsAppNotification(
      job.appointmentData,
      job.type,
      job.extra
    )

    if (success) {
      await doc.ref.update({ status: 'completed', completedAt: admin.firestore.FieldValue.serverTimestamp() })
    } else {
      await doc.ref.update({
        retries: job.retries + 1,
        nextRetryAt: new Date(Date.now() + 60000 * (job.retries + 1)).toISOString(),
        lastError: 'Retry failed',
      })
    }
  }
}
