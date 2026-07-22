import type { Appointment } from '@/types'

export interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<boolean>
}

export interface EmailTemplate {
  subject: string
  html: string
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const days = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado']
  const months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${days[date.getDay()]}, ${day} de ${months[date.getMonth()]}`
}

function baseLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #fafafa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 24px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 20px; }
        .content { padding: 24px; color: #333; line-height: 1.6; }
        .footer { padding: 16px 24px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
        .button { display: inline-block; background: #e11d48; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NB Nail</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>NB Nail &mdash; Nail Design</p>
          <p>Este e um e-mail automatico.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const emailTemplates = {
  confirmation(apt: Appointment): EmailTemplate {
    return {
      subject: `Agendamento Confirmado - ${apt.serviceName}`,
      html: baseLayout(`
        <h2>Seu agendamento foi confirmado!</h2>
        <p>Ola, <strong>${apt.clientName}</strong>!</p>
        <p>Seu agendamento foi confirmado com sucesso:</p>
        <ul>
          <li><strong>Servico:</strong> ${apt.serviceName}</li>
          <li><strong>Data:</strong> ${formatDate(apt.date)}</li>
          <li><strong>Horario:</strong> ${apt.time}</li>
          <li><strong>Valor:</strong> R$ ${apt.servicePrice.toFixed(2).replace('.', ',')}</li>
        </ul>
        <p>Aguardamos voce!</p>
      `),
    }
  },

  cancellation(apt: Appointment): EmailTemplate {
    return {
      subject: `Agendamento Cancelado - ${apt.serviceName}`,
      html: baseLayout(`
        <h2>Agendamento cancelado</h2>
        <p>Ola, <strong>${apt.clientName}</strong>.</p>
        <p>Seu agendamento foi cancelado:</p>
        <ul>
          <li><strong>Servico:</strong> ${apt.serviceName}</li>
          <li><strong>Data:</strong> ${formatDate(apt.date)}</li>
          <li><strong>Horario:</strong> ${apt.time}</li>
        </ul>
        <p>Se precisar reagendar, entre em contato conosco.</p>
      `),
    }
  },

  reschedule(apt: Appointment): EmailTemplate {
    return {
      subject: `Agendamento Reagendado - ${apt.serviceName}`,
      html: baseLayout(`
        <h2>Seu agendamento foi reagendado</h2>
        <p>Ola, <strong>${apt.clientName}</strong>!</p>
        <p>Seu agendamento foi atualizado:</p>
        <ul>
          <li><strong>Servico:</strong> ${apt.serviceName}</li>
          <li><strong>Nova data:</strong> ${formatDate(apt.date)}</li>
          <li><strong>Novo horario:</strong> ${apt.time}</li>
        </ul>
        <p>Aguardamos voce na nova data!</p>
      `),
    }
  },

  reminder(apt: Appointment): EmailTemplate {
    return {
      subject: `Lembrete - Agendamento Amanha`,
      html: baseLayout(`
        <h2>Lembrete do seu agendamento</h2>
        <p>Ola, <strong>${apt.clientName}</strong>!</p>
        <p>Este e um lembrete do seu agendamento amanha:</p>
        <ul>
          <li><strong>Servico:</strong> ${apt.serviceName}</li>
          <li><strong>Data:</strong> ${formatDate(apt.date)}</li>
          <li><strong>Horario:</strong> ${apt.time}</li>
        </ul>
        <p>Aguardamos voce!</p>
      `),
    }
  },

  postService(apt: Appointment): EmailTemplate {
    return {
      subject: `Obrigada por nos escolher!`,
      html: baseLayout(`
        <h2>Obrigada pela sua visita!</h2>
        <p>Ola, <strong>${apt.clientName}</strong>!</p>
        <p>Ficamos felizes em atende-lo(a) hoje.</p>
        <ul>
          <li><strong>Servico realizado:</strong> ${apt.serviceName}</li>
          <li><strong>Data:</strong> ${formatDate(apt.date)}</li>
        </ul>
        <p>Esperamos ve-lo(a) em breve!</p>
      `),
    }
  },
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(_to: string, _subject: string, _html: string): Promise<boolean> {
    console.log('[EmailProvider] E-mail enviado (simulado):', _to, _subject)
    return true
  }
}

export const emailProvider: EmailProvider = new ConsoleEmailProvider()

export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  return emailProvider.send(to, template.subject, template.html)
}

export async function sendAppointmentEmail(
  appointment: Appointment,
  template: keyof typeof emailTemplates
): Promise<boolean> {
  const emailTemplate = emailTemplates[template](appointment)
  return sendEmail(appointment.clientPhone, emailTemplate)
}
