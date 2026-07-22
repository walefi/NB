import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, Check, X, Ban, Edit, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatBookingDate, formatPrice } from '@/lib/utils'
import { STATUS_LABELS, PAYMENT_LABELS } from '@/constants'
import type { Appointment, AppointmentStatus } from '@/types'

interface AppointmentListProps {
  appointments: Appointment[]
  loading: boolean
  onUpdateStatus: (id: string, status: AppointmentStatus) => void
  onConfirm: (id: string) => void
  onCancel: (id: string) => void
  onComplete: (id: string) => void
  onNoShow: (id: string) => void
  onEdit: (id: string) => void
  onReschedule: (id: string) => void
  onDelete: (id: string) => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-pink-light dark:bg-pink-dark/20 text-rose dark:text-rose-light',
  confirmed: 'bg-rose-100 dark:bg-rose-dark/30 text-rose-dark dark:text-rose-light',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  no_show: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.14 2 19.67 19.67 0 0 1-4.63-1.4 19.67 19.67 0 0 1-4.63-1.4 19.67 19.67 0 0 1-4.63-1.4 2 2 0 0 1-.06-3A19.67 19.67 0 0 1 2 7.92a2 2 0 0 1 2-2h3a2 2 0 0 1 2 1.72 19.67 19.67 0 0 0 4.63 1.4 19.67 19.67 0 0 0 4.63 1.4A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

export function AppointmentList({
  appointments,
  loading,
  onConfirm,
  onCancel,
  onComplete,
  onNoShow,
  onEdit,
  onReschedule,
  onDelete,
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
          <CalendarIcon className="w-8 h-8 text-rose dark:text-rose-light" />
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
                  <CalendarIcon className="w-5 h-5 text-rose dark:text-rose-light" />
                </div>
                <div>
                  <h4 className="font-medium text-black dark:text-white">
                    {apt.clientName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-black/50 dark:text-white/50 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {apt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3" />
                      {apt.clientPhone}
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
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Servico</p>
                    <p className="font-medium text-black dark:text-white">{apt.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Duracao</p>
                    <p className="font-medium text-black dark:text-white">{apt.serviceDuration}min</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Data</p>
                    <p className="font-medium text-black dark:text-white">{formatBookingDate(apt.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Pagamento</p>
                    <p className="font-medium text-black dark:text-white">
                      {PAYMENT_LABELS[apt.paymentMethod] || apt.paymentMethod}
                    </p>
                  </div>
                  {apt.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-black/50 dark:text-white/50">Observacoes</p>
                      <p className="font-medium text-black dark:text-white">{apt.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-rose-100 dark:border-rose-dark/20">
                  {apt.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => { onConfirm(apt.id); setExpandedId(null) }}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { onCancel(apt.id); setExpandedId(null) }}
                        className="flex items-center gap-1"
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
                        onClick={() => { onComplete(apt.id); setExpandedId(null) }}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { onNoShow(apt.id); setExpandedId(null) }}
                        className="flex items-center gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Não Compareceu
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { onEdit(apt.id); setExpandedId(null) }}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { onReschedule(apt.id); setExpandedId(null) }}
                        className="flex items-center gap-1"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Reagendar
                      </Button>
                    </>
                  )}
                  {(apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { onDelete(apt.id); setExpandedId(null) }}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </Button>
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