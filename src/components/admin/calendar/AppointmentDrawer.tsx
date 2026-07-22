import { memo, useCallback } from 'react'
import {
  X,
  User,
  Phone,
  Clock,
  Calendar,
  CreditCard,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Edit3,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  getStatusColor,
  getStatusLabel,
  formatTimeRange,
  formatDate,
} from '@/lib/calendar/utils'
import { PAYMENT_LABELS } from '@/constants'
import type { Appointment, AppointmentStatus } from '@/types'

interface Props {
  appointment: Appointment | null
  onClose: () => void
  onUpdateStatus: (id: string, status: AppointmentStatus) => void
  onEdit: (apt: Appointment) => void
  onReschedule: (apt: Appointment) => void
  onDelete: (id: string) => void
  onWhatsApp: (phone: string, name: string) => void
}

export const AppointmentDrawer = memo(function AppointmentDrawer({
  appointment,
  onClose,
  onUpdateStatus,
  onEdit,
  onReschedule,
  onDelete,
  onWhatsApp,
}: Props) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  if (!appointment) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Fechar"
      />

      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-black z-50
          shadow-2xl border-l border-rose-100 dark:border-rose-dark/20
          transform transition-transform duration-300 ease-out translate-x-0"
        role="dialog"
        aria-label="Detalhes do agendamento"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-rose-100 dark:border-rose-dark/20">
            <h2 className="text-lg font-bold text-black dark:text-white">
              Detalhes do Agendamento
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className={`p-3 rounded-xl border-l-4 ${getStatusColor(appointment.status)}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{getStatusLabel(appointment.status)}</span>
                <span className="text-sm opacity-75">
                  {formatTimeRange(appointment.time, appointment.serviceDuration)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <User className="w-5 h-5 text-rose shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    {appointment.clientName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cliente</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <Phone className="w-5 h-5 text-rose shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    {appointment.clientPhone}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Telefone</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <Calendar className="w-5 h-5 text-rose shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    {formatDate(appointment.date)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Data</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <Clock className="w-5 h-5 text-rose shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    {appointment.time} ({appointment.serviceDuration}min)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Horario e Duracao</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <CreditCard className="w-5 h-5 text-rose shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    {PAYMENT_LABELS[appointment.paymentMethod] || appointment.paymentMethod}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Forma de Pagamento</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-medium text-black dark:text-white mb-1">
                  {appointment.serviceName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Servico - R$ {appointment.servicePrice.toFixed(2).replace('.', ',')}
                </p>
              </div>

              {appointment.notes && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <MessageSquare className="w-5 h-5 text-rose shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-black dark:text-white">{appointment.notes}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Observacoes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-rose-100 dark:border-rose-dark/20 space-y-2">
            {appointment.status === 'pending' && (
              <Button
                onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar
              </Button>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <Button
                onClick={() => onUpdateStatus(appointment.id, 'completed')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                Concluir
              </Button>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <Button
                variant="outline"
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => onEdit(appointment)}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                onClick={() => onReschedule(appointment)}
                className="flex-1"
              >
                <Calendar className="w-4 h-4" />
                Reagendar
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => onWhatsApp(appointment.clientPhone, appointment.clientName)}
                className="flex-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="ghost"
                onClick={() => onDelete(appointment.id)}
                className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})
