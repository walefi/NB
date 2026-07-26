import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/shared/Header'
import { Card } from '@/components/ui/Card'
import { formatBookingDate, formatPrice } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/admin/whatsapp'
import { useBusinessSettings } from '@/hooks/admin/useBusinessSettings'
import type { Appointment, ThemeMode } from '@/types'
import { STATUS_LABELS } from '@/constants'

interface BookingConfirmationProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const days = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado']
  const months = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  return `${days[date.getDay()]}, ${day} de ${months[date.getMonth()]}`
}

export function BookingConfirmation({ theme, onToggleTheme }: BookingConfirmationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { settings } = useBusinessSettings()
  const appointment = location.state?.appointment as Appointment | undefined

  if (!appointment) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header theme={theme} onToggleTheme={onToggleTheme} />
        <div className="max-w-lg mx-auto px-4 pt-20 text-center">
          <h1 className="font-serif text-2xl font-bold text-black dark:text-white mb-4">
            Nenhum agendamento encontrado
          </h1>
          <p className="text-black/60 dark:text-white/60 mb-8">
            Volte para a pagina inicial e faca seu agendamento.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Voltar para pagina inicial
          </Button>
        </div>
      </div>
    )
  }

  const salonPhone = settings?.whatsapp || settings?.phone || ''
  const message = `Ola!\n\nAcabei de realizar um agendamento:\n\nNome: ${appointment.clientName}\nServico: ${appointment.serviceName}\nData: ${formatDate(appointment.date)}\nHorario: ${appointment.time}\n\nAguardo confirmacao.`
  const whatsappUrl = salonPhone
    ? buildWhatsAppUrl(salonPhone, message)
    : `https://wa.me/55?text=${encodeURIComponent(message)}`

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-16 pb-16">
        <div className="text-center mb-8 animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-dark/20 mb-6">
            <CheckCircle2 className="w-10 h-10 text-rose dark:text-rose-light" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black dark:text-white mb-3">
            Agendamento solicitado!
          </h1>
          <p className="text-black/60 dark:text-white/60 leading-relaxed">
            Entraremos em contato pelo WhatsApp para confirmar seu horario.
          </p>
        </div>

        <Card className="animate-fade-in stagger-1">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-rose-100 dark:border-rose-dark/20">
              <span className="text-sm text-black/60 dark:text-white/60">Status</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-light dark:bg-pink-dark/20 text-rose dark:text-rose-light">
                {STATUS_LABELS[appointment.status]}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/60 dark:text-white/60">Servico</span>
              <span className="font-medium text-black dark:text-white">{appointment.serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/60 dark:text-white/60">Data</span>
              <span className="font-medium text-black dark:text-white">{formatBookingDate(appointment.date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/60 dark:text-white/60">Horario</span>
              <span className="font-medium text-black dark:text-white">{appointment.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/60 dark:text-white/60">Nome</span>
              <span className="font-medium text-black dark:text-white">{appointment.clientName}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-rose-100 dark:border-rose-dark/20">
              <span className="text-lg font-semibold text-rose dark:text-rose-light">Valor</span>
              <span className="text-xl font-bold text-rose dark:text-rose-light">
                {formatPrice(appointment.servicePrice)}
              </span>
            </div>
          </div>
        </Card>

        <div className="mt-6 animate-fade-in stagger-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-lg transition-colors shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-6 h-6" />
            Enviar Agendamento pelo WhatsApp
          </a>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Voltar para pagina inicial
          </Button>
        </div>
      </div>
    </div>
  )
}
