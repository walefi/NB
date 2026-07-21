import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/shared/Header'
import { Card } from '@/components/ui/Card'
import { formatBookingDate, formatPrice } from '@/lib/utils'
import type { Appointment, ThemeMode } from '@/types'
import { STATUS_LABELS } from '@/constants'

interface BookingConfirmationProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function BookingConfirmation({ theme, onToggleTheme }: BookingConfirmationProps) {
  const location = useLocation()
  const navigate = useNavigate()
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
            Volte para a página inicial e faça seu agendamento.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Voltar para página inicial
          </Button>
        </div>
      </div>
    )
  }

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
            Entraremos em contato pelo WhatsApp para confirmar seu horário.
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
              <span className="text-sm text-black/60 dark:text-white/60">Serviço</span>
              <span className="font-medium text-black dark:text-white">{appointment.serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/60 dark:text-white/60">Data</span>
              <span className="font-medium text-black dark:text-white">{formatBookingDate(appointment.date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/60 dark:text-white/60">Horário</span>
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

        <div className="mt-8 text-center">
          <Button size="lg" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Voltar para página inicial
          </Button>
        </div>
      </div>
    </div>
  )
}
