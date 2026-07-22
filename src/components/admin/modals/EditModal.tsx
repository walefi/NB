import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { Appointment, AppointmentStatus } from '@/types'
import { formatBookingDate, formatPrice } from '@/lib/utils'
import { PAYMENT_LABELS } from '@/constants'

interface EditModalProps {
  appointment: Appointment | null
  onClose: () => void
  onUpdate: (id: string, data: Partial<Appointment>) => void
}

export function EditModal({ appointment, onClose, onUpdate }: EditModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('pending')

  if (!appointment) return null

  const handleConfirm = () => {
    onUpdate(appointment.id, {
      clientName,
      clientPhone,
      notes,
      status,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-lg w-full p-6 sm:p-8 animate-fade-in">
        <div className="flex items-start justify-between mb-6">
          <h3 className="font-serif text-lg font-semibold text-black dark:text-white">
            Editar Agendamento
          </h3>
          <button
            onClick={onClose}
            className="text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black dark:text-white mb-2">Nome</label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-black dark:text-white mb-2">Telefone</label>
            <Input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              inputMode="tel"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-black dark:text-white mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="w-full px-3 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none"
            >
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
              <option value="no_show">Não Compareceu</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-black dark:text-white mb-2">Observacoes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observacoes sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="text-xs text-black/50 dark:text-white/50">
            <p><strong>Servico:</strong> {appointment.serviceName}</p>
            <p><strong>Valor:</strong> {formatPrice(appointment.servicePrice)}</p>
            <p><strong>Data:</strong> {formatBookingDate(appointment.date)} • {appointment.time}</p>
            <p><strong>Pagamento:</strong> {PAYMENT_LABELS[appointment.paymentMethod]}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </div>
      </div>
    </div>
  )
}