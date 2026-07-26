import type { Appointment } from '@/types'

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return digits
  if (digits.length >= 10) return `55${digits}`
  return digits
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const days = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado']
  const months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${days[date.getDay()]}, ${day} de ${months[date.getMonth()]}`
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizePhone(phone)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}?text=${encoded}`
}

export function buildAppointmentMessage(apt: Appointment): string {
  return `Ola, ${apt.clientName}.\nRecebemos seu agendamento:\n\nServico: ${apt.serviceName}\nData: ${formatDate(apt.date)}\nHorario: ${apt.time}\n\nAguardo confirmacao.`
}

export const whatsappTemplates = {
  confirmation(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}!\n\nSeu agendamento foi confirmado:\n\nServico: ${apt.serviceName}\nData: ${formatDate(apt.date)}\nHorario: ${apt.time}\n\nAguardamos voce!\nNB Nail`
    return buildWhatsAppUrl(apt.clientPhone, text)
  },

  cancellation(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}!\n\nSeu agendamento foi cancelado:\n\nServico: ${apt.serviceName}\nData: ${formatDate(apt.date)}\nHorario: ${apt.time}\n\nSe precisar reagendar, entre em contato.\nNB Nail`
    return buildWhatsAppUrl(apt.clientPhone, text)
  },

  reschedule(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}!\n\nSeu agendamento foi reagendado:\n\nServico: ${apt.serviceName}\nNova data: ${formatDate(apt.date)}\nNovo horario: ${apt.time}\n\nAguardamos voce!\nNB Nail`
    return buildWhatsAppUrl(apt.clientPhone, text)
  },

  reminder(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}!\n\nLembrete do seu agendamento amanha:\n\nServico: ${apt.serviceName}\nData: ${formatDate(apt.date)}\nHorario: ${apt.time}\n\nAguardamos voce!\nNB Nail`
    return buildWhatsAppUrl(apt.clientPhone, text)
  },

  postService(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}!\n\nObrigada por escolher a NB Nail!\n\nServico realizado: ${apt.serviceName}\nData: ${formatDate(apt.date)}\n\nFicamos felizes em atende-lo(a)!\nAguardamos voce na proxima visita.\n\nNB Nail`
    return buildWhatsAppUrl(apt.clientPhone, text)
  },
}

export function openWhatsApp(apt: Appointment, template: keyof typeof whatsappTemplates): void {
  const url = whatsappTemplates[template](apt)
  window.open(url, '_blank', 'noopener,noreferrer')
}
