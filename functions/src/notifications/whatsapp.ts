import * as admin from 'firebase-admin'

const META_API_VERSION = 'v21.0'
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
}

interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'template' | 'text'
  template?: {
    name: string
    language: { code: string }
    components?: Array<{
      type: string
      parameters: Array<{ type: string; text: string }>
    }>
  }
  text?: {
    preview_url: boolean
    body: string
  }
}

interface WhatsAppResponse {
  messages?: Array<{ id: string; status: string }>
  error?: {
    message: string
    type: string
    code: number
  }
}

function getConfig(): WhatsAppConfig {
  const accessToken = process.env.META_ACCESS_TOKEN
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID

  if (!accessToken || !phoneNumberId || !businessAccountId) {
    throw new Error(
      'Meta WhatsApp env vars missing: META_ACCESS_TOKEN, META_PHONE_NUMBER_ID, META_BUSINESS_ACCOUNT_ID'
    )
  }

  return { accessToken, phoneNumberId, businessAccountId }
}

function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('55')) return cleaned
  return `55${cleaned}`
}

export async function sendWhatsAppText(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getConfig()
  const formattedPhone = formatPhoneForWhatsApp(to)

  const payload: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: message,
    },
  }

  try {
    const response = await fetch(
      `${META_BASE_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = (await response.json()) as WhatsAppResponse

    if (data.error) {
      console.error('WhatsApp API error:', data.error)
      return { success: false, error: data.error.message }
    }

    if (data.messages && data.messages.length > 0) {
      return { success: true, messageId: data.messages[0].id }
    }

    return { success: false, error: 'No message ID returned' }
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  parameters: string[] = []
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getConfig()
  const formattedPhone = formatPhoneForWhatsApp(to)

  const payload: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(parameters.length > 0 && {
        components: [
          {
            type: 'body',
            parameters: parameters.map((text) => ({ type: 'text', text })),
          },
        ],
      }),
    },
  }

  try {
    const response = await fetch(
      `${META_BASE_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = (await response.json()) as WhatsAppResponse

    if (data.error) {
      console.error('WhatsApp Template API error:', data.error)
      return { success: false, error: data.error.message }
    }

    if (data.messages && data.messages.length > 0) {
      return { success: true, messageId: data.messages[0].id }
    }

    return { success: false, error: 'No message ID returned' }
  } catch (err) {
    console.error('WhatsApp template send error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function logNotification(data: {
  provider: string
  status: 'sent' | 'failed' | 'pending'
  appointmentId: string
  phone: string
  messageId?: string
  error?: string
  type: string
}): Promise<void> {
  const db = admin.firestore()
  await db.collection('notification_logs').add({
    provider: data.provider,
    status: data.status,
    appointmentId: data.appointmentId,
    phone: data.phone,
    messageId: data.messageId || null,
    error: data.error || null,
    type: data.type,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
}
