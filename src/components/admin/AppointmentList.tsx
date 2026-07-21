import { useState } from 'react'
import { Calendar, Clock, Phone, CreditCard, Check, X, Ban, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatBookingDate, formatPrice } from '@/lib/utils'
import { STATUS_LABELS } from '@/constants'
import type { Appointment, AppointmentStatus } from '@/types'

interface AppointmentListProps {
  appointments: Appointment[]
  loading: boolean
  onUpdateStatus: (id: string, status: AppointmentStatus) => void
}

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  card: 'Cartão',
  cash: 'Dinheiro',
  to_combine: 'A combinar',
}

const statusColors: Record<string, string> = {
  pending: 'bg-pink-light dark:bg-pink-dark/20 text-rose dark:text-rose-light',
  confirmed: 'bg-rose-100 dark:bg-rose-dark/30 text-rose-dark dark:text-rose-light',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  no_show: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

export function AppointmentList({
  appointments,
  loading,
  onUpdateStatus,
}: AppointmentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-6 animate-pulse"
          >
            <div className="h-5 bg-rose-100 dark:bg-rose-dark/20 rounded w-1/3 mb-3" />
            <div className="h-4 bg-rose-50 dark:bg-rose-dark/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-rose dark:text-rose-light" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-2">
          Nenhum agendamento
        </h3>
        <p className="text-sm text-black/50 dark:text-white/50">
          Nenhum agendamento encontrado para este período.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => {
        const isExpanded = expandedId === apt.id
        return (
          <Card key={apt.id} className="overflow-hidden">
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : apt.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-rose dark:text-rose-light" />
                </div>
                <div>
                  <h4 className="font-medium text-black dark:text-white">
                    {apt.clientName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-black/50 dark:text-white/50 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatBookingDate(apt.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {apt.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                  {STATUS_LABELS[apt.status]}
                </span>
                <span className="text-sm font-semibold text-black dark:text-white">
                  {formatPrice(apt.servicePrice)}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-rose dark:text-rose-light" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-rose dark:text-rose-light" />
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-rose-100 dark:border-rose-dark/20 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-black dark:text-white/70">
                    <ScissorsIcon className="w-4 h-4 text-rose dark:text-rose-light" />
                    <span className="text-black/50 dark:text-white/50">Serviço:</span>
                    <span className="font-medium text-black dark:text-white">{apt.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-black dark:text-white/70">
                    <Phone className="w-4 h-4 text-rose dark:text-rose-light" />
                    <span className="text-black/50 dark:text-white/50">WhatsApp:</span>
                    <span className="font-medium text-black dark:text-white">{apt.clientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-black dark:text-white/70">
                    <CreditCard className="w-4 h-4 text-rose dark:text-rose-light" />
                    <span className="text-black/50 dark:text-white/50">Pagamento:</span>
                    <span className="font-medium text-black dark:text-white">
                      {paymentLabels[apt.paymentMethod] || apt.paymentMethod}
                    </span>
                  </div>
                  {apt.notes && (
                    <div className="flex items-start gap-2 text-black dark:text-white/70 sm:col-span-2">
                      <Eye className="w-4 h-4 text-rose dark:text-rose-light mt-0.5" />
                      <span className="text-black/50 dark:text-white/50">Obs:</span>
                      <span className="font-medium text-black dark:text-white">{apt.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-rose-100 dark:border-rose-dark/20">
                  {apt.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  {apt.status === 'confirmed' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(apt.id, 'completed')}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(apt.id, 'no_show')}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Não compareceu
                      </Button>
                    </>
                  )}
                  {(apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show') && (
                    <span className="text-xs text-rose dark:text-rose-light/50 italic px-3 py-2">
                      Este agendamento foi {STATUS_LABELS[apt.status].toLowerCase()}.
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="8.6" y1="8.6" x2="20" y2="20" />
      <line x1="15.4" y1="15.4" x2="20" y2="20" />
      <line x1="8.6" y1="15.4" x2="20" y2="4" />
      <line x1="15.4" y1="8.6" x2="20" y2="4" />
    </svg>
  )
}
