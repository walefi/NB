import * as admin from 'firebase-admin'
import { logNotification } from './whatsapp'

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

interface PushPayload {
  title: string
  body: string
  appointmentId: string
}

function buildPushPayload(
  appointment: AppointmentData,
  type: string,
  extra?: { newDate?: string; newTime?: string }
): PushPayload {
  switch (type) {
    case 'new_appointment':
      return {
        title: '💅 Novo Agendamento',
        body: `${appointment.clientName} agendou ${appointment.serviceName} às ${appointment.time}.`,
        appointmentId: appointment.id,
      }

    case 'confirmed':
      return {
        title: '✅ Agendamento Confirmado',
        body: `${appointment.serviceName} para ${appointment.date} às ${appointment.time}.`,
        appointmentId: appointment.id,
      }

    case 'cancelled':
      return {
        title: '❌ Agendamento Cancelado',
        body: `${appointment.serviceName} para ${appointment.date} às ${appointment.time}.`,
        appointmentId: appointment.id,
      }

    case 'rescheduled':
      return {
        title: '📅 Agendamento Reagendado',
        body: `${appointment.serviceName} reagendado para ${extra?.newDate || appointment.date} às ${extra?.newTime || appointment.time}.`,
        appointmentId: appointment.id,
      }

    default:
      return {
        title: 'Notificação NB Nail',
        body: `Atualização no agendamento de ${appointment.clientName}.`,
        appointmentId: appointment.id,
      }
  }
}

export async function sendPushToAdmins(
  appointment: AppointmentData,
  type: string,
  extra?: { newDate?: string; newTime?: string }
): Promise<void> {
  const db = admin.firestore()
  const messaging = admin.messaging()

  const snapshot = await db.collection('adminTokens').get()
  if (snapshot.empty) {
    console.log('No admin tokens found, skipping FCM')
    return
  }

  const tokens: string[] = []
  const tokenDocs: admin.firestore.QueryDocumentSnapshot[] = []

  snapshot.docs.forEach((doc) => {
    const data = doc.data()
    if (data.token) {
      tokens.push(data.token)
      tokenDocs.push(doc)
    }
  })

  if (tokens.length === 0) return

  const payload = buildPushPayload(appointment, type, extra)

  const multicastMessage: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      appointmentId: payload.appointmentId,
      type,
    },
    webpush: {
      fcmOptions: {
        link: '/admin/dashboard',
      },
      notification: {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: payload.appointmentId,
        renotify: true,
      },
    },
  }

  try {
    const response = await messaging.sendEachForMulticast(multicastMessage)

    let successCount = 0
    let failureCount = 0
    const tokensToRemove: string[] = []

    response.responses.forEach((resp, idx) => {
      if (resp.success) {
        successCount++
      } else {
        failureCount++
        const error = resp.error
        if (
          error?.code === 'messaging/registration-token-not-registered' ||
          error?.code === 'messaging/invalid-registration-token'
        ) {
          tokensToRemove.push(tokenDocs[idx].id)
        }
      }
    })

    console.log(`FCM: ${successCount} sent, ${failureCount} failed`)

    for (const docId of tokensToRemove) {
      await db.collection('adminTokens').doc(docId).delete()
      console.log(`Cleaned up invalid token: ${docId}`)
    }

    await logNotification({
      provider: 'fcm',
      status: failureCount === 0 ? 'sent' : 'failed',
      appointmentId: appointment.id,
      phone: '',
      messageId: `fcm-${Date.now()}`,
      error: failureCount > 0 ? `${failureCount} tokens failed` : undefined,
      type,
    })
  } catch (err) {
    console.error('FCM sendEach error:', err)
    await logNotification({
      provider: 'fcm',
      status: 'failed',
      appointmentId: appointment.id,
      phone: '',
      error: err instanceof Error ? err.message : 'Unknown FCM error',
      type,
    })
  }
}
