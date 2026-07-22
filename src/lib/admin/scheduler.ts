import type { Appointment } from '@/types'
import { createNotification } from '@/lib/firebase/notifications'

export interface ReminderCheck {
  appointmentId: string
  type: 'reminder_24h' | 'reminder_2h' | 'reminder_30min'
  sent: boolean
  sentAt?: string
}

const STORAGE_KEY = 'nb_reminder_checks'

function getLocalChecks(): ReminderCheck[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalChecks(checks: ReminderCheck[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checks))
}

function wasReminderSent(appointmentId: string, type: ReminderCheck['type']): boolean {
  const checks = getLocalChecks()
  return checks.some((c) => c.appointmentId === appointmentId && c.type === type && c.sent)
}

function markReminderSent(appointmentId: string, type: ReminderCheck['type']): void {
  const checks = getLocalChecks()
  const existing = checks.find((c) => c.appointmentId === appointmentId && c.type === type)
  if (existing) {
    existing.sent = true
    existing.sentAt = new Date().toISOString()
  } else {
    checks.push({
      appointmentId,
      type,
      sent: true,
      sentAt: new Date().toISOString(),
    })
  }
  saveLocalChecks(checks)
}

function getMinutesUntil(dateStr: string, timeStr: string): number {
  const now = new Date()
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  const target = new Date(year, month - 1, day, hours, minutes)
  return (target.getTime() - now.getTime()) / (1000 * 60)
}

export async function checkAndSendReminders(appointments: Appointment[]): Promise<void> {
  const activeAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending'
  )

  for (const apt of activeAppointments) {
    const minutesUntil = getMinutesUntil(apt.date, apt.time)

    if (minutesUntil > 0 && minutesUntil <= 1440 && !wasReminderSent(apt.id, 'reminder_24h')) {
      await createNotification({
        type: 'reminder_24h',
        title: 'Lembrete - 24h',
        message: `${apt.clientName} tem agendamento amanha as ${apt.time} - ${apt.serviceName}.`,
        appointmentId: apt.id,
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        date: apt.date,
        time: apt.time,
      })
      markReminderSent(apt.id, 'reminder_24h')
    }

    if (minutesUntil > 0 && minutesUntil <= 120 && !wasReminderSent(apt.id, 'reminder_2h')) {
      await createNotification({
        type: 'reminder_2h',
        title: 'Lembrete - 2h',
        message: `${apt.clientName} chega em 2 horas - ${apt.serviceName} as ${apt.time}.`,
        appointmentId: apt.id,
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        date: apt.date,
        time: apt.time,
      })
      markReminderSent(apt.id, 'reminder_2h')
    }

    if (minutesUntil > 0 && minutesUntil <= 30 && !wasReminderSent(apt.id, 'reminder_30min')) {
      await createNotification({
        type: 'reminder_30min',
        title: 'Lembrete - 30min',
        message: `${apt.clientName} chega em 30 minutos - ${apt.serviceName} as ${apt.time}.`,
        appointmentId: apt.id,
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        date: apt.date,
        time: apt.time,
      })
      markReminderSent(apt.id, 'reminder_30min')
    }
  }
}
