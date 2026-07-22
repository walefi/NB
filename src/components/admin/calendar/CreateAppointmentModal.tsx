import { memo, useState, useCallback } from 'react'
import { X, Calendar, User, Phone, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createAppointment } from '@/lib/firebase/appointments'
import { formatDate } from '@/lib/calendar/utils'
import { PAYMENT_METHODS } from '@/constants'
import type { Service, PaymentMethod } from '@/types'

interface Props {
  date: string
  time: string
  services: Service[]
  onClose: () => void
  onCreated: () => void
}

export const CreateAppointmentModal = memo(function CreateAppointmentModal({
  date,
  time,
  services,
  onClose,
  onCreated,
}: Props) {
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: '',
    paymentMethod: 'pix' as PaymentMethod,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedService = services.find((s) => s.id === form.serviceId)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!form.clientName || !form.clientPhone || !form.serviceId) {
        setError('Preencha todos os campos obrigatorios.')
        return
      }

      setLoading(true)
      setError('')

      try {
        await createAppointment({
          serviceId: form.serviceId,
          serviceName: selectedService?.name || '',
          servicePrice: selectedService?.price || 0,
          serviceDuration: selectedService?.duration || 60,
          clientName: form.clientName,
          clientPhone: form.clientPhone,
          date,
          time,
          paymentMethod: form.paymentMethod,
          notes: form.notes || undefined,
        })
        onCreated()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar agendamento.')
      } finally {
        setLoading(false)
      }
    },
    [form, selectedService, date, time, onCreated]
  )

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/80 z-40"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Fechar"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-rose-100 dark:border-rose-dark/20">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Novo Agendamento
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-dark/10">
              <Calendar className="w-5 h-5 text-rose" />
              <span className="text-sm font-medium text-black dark:text-white">
                {formatDate(date)} as {time}
              </span>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
                <User className="w-4 h-4 text-rose" />
                Nome do Cliente *
              </label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
                <Phone className="w-4 h-4 text-rose" />
                Telefone *
              </label>
              <input
                type="tel"
                value={form.clientPhone}
                onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black dark:text-white mb-1 block">
                Servico *
              </label>
              <select
                value={form.serviceId}
                onChange={(e) => setForm((p) => ({ ...p, serviceId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
                required
              >
                <option value="">Selecione um servico</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - R$ {s.price.toFixed(2).replace('.', ',')} ({s.duration}min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
                <CreditCard className="w-4 h-4 text-rose" />
                Forma de Pagamento
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value as PaymentMethod }))}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-black dark:text-white mb-1 block">
                Observacoes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
                rows={2}
                placeholder="Observacoes opcionais"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Criar Agendamento
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
})
