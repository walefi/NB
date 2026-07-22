import type { Appointment } from '@/types'

const PHONE_NUMBER_REGEX = /\D/g

function cleanPhone(phone: string): string {
  return phone.replace(PHONE_NUMBER_REGEX, '')
}

function buildWaUrl(phone: string, text: string): string {
  const cleaned = cleanPhone(phone)
  const encoded = encodeURIComponent(text)
  return `https://wa.me/${cleaned}?text=${encoded}`
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const days = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado']
  const months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${days[date.getDay()]}, ${day} de ${months[date.getMonth()]}`
}

export const whatsappTemplates = {
  confirmation(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}! 

Seu agendamento foi confirmado:

Servico: ${apt.serviceName}
Data: ${formatDate(apt.date)}
Horario: ${apt.time}

Aguardamos voce! 
NB Nail`
    return buildWaUrl(apt.clientPhone, text)
  },

  cancellation(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}! 

Seu agendamento foi cancelado:

Servico: ${apt.serviceName}
Data: ${formatDate(apt.date)}
Horario: ${apt.time}

Se precisar reagendar, entre em contato.
NB Nail`
    return buildWaUrl(apt.clientPhone, text)
  },

  reschedule(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}! 

Seu agendamento foi reagendado:

Servico: ${apt.serviceName}
Nova data: ${formatDate(apt.date)}
Novo horario: ${apt.time}

Aguardamos voce!
NB Nail`
    return buildWaUrl(apt.clientPhone, text)
  },

  reminder(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}! 

Lembrete do seu agendamento amanha:

Servico: ${apt.serviceName}
Data: ${formatDate(apt.date)}
Horario: ${apt.time}

Aguardamos voce!
NB Nail`
    return buildWaUrl(apt.clientPhone, text)
  },

  postService(apt: Appointment): string {
    const text = `Ola, ${apt.clientName}! 

Obrigada por escolher a NB Nail! 

Servico realizado: ${apt.serviceName}
Data: ${formatDate(apt.date)}

Ficamos felizes em atende-lo(a)!
Aguardamos voce na proxima visita. 

NB Nail`
    return buildWaUrl(apt.clientPhone, text)
  },
}

export function openWhatsApp(apt: Appointment, template: keyof typeof whatsappTemplates): void {
  const url = whatsappTemplates[template](apt)
  window.open(url, '_blank', 'noopener,noreferrer')
}
