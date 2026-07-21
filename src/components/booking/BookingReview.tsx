import { formatBookingDate } from '@/lib/utils'
import { formatDuration, formatPrice, PAYMENT_LABELS } from '@/constants'
import type { Service, PaymentMethod } from '@/types'

interface BookingReviewProps {
  service: Service | null
  date: string
  time: string
  clientName: string
  clientPhone: string
  paymentMethod: PaymentMethod | ''
}

export function BookingReview({
  service,
  date,
  time,
  clientName,
  clientPhone,
  paymentMethod,
}: BookingReviewProps) {
  return (
    <div className="rounded-2xl border-2 border-rose-100 dark:border-rose-dark/20 divide-y divide-rose-100 dark:divide-rose-dark/20 overflow-hidden">
      {service && (
        <div className="flex justify-between items-center p-4 bg-rose-50/50 dark:bg-rose-dark/10">
          <span className="text-sm text-rose dark:text-rose-light/70">Servico</span>
          <div className="text-right">
            <span className="font-medium text-black dark:text-white text-sm">{service.name}</span>
            <span className="block text-xs text-rose/60 dark:text-rose-light/50">
              {formatDuration(service.duration)}
            </span>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center p-4">
        <span className="text-sm text-black/50 dark:text-white/50">Data</span>
        <span className="font-medium text-black dark:text-white text-sm">{formatBookingDate(date)}</span>
      </div>
      <div className="flex justify-between items-center p-4">
        <span className="text-sm text-black/50 dark:text-white/50">Horario</span>
        <span className="font-medium text-black dark:text-white text-sm">{time}</span>
      </div>
      <div className="flex justify-between items-center p-4">
        <span className="text-sm text-black/50 dark:text-white/50">Nome</span>
        <span className="font-medium text-black dark:text-white text-sm">{clientName}</span>
      </div>
      <div className="flex justify-between items-center p-4">
        <span className="text-sm text-black/50 dark:text-white/50">WhatsApp</span>
        <span className="font-medium text-black dark:text-white text-sm">{clientPhone}</span>
      </div>
      <div className="flex justify-between items-center p-4">
        <span className="text-sm text-black/50 dark:text-white/50">Pagamento</span>
        <span className="font-medium text-black dark:text-white text-sm">
          {paymentMethod ? PAYMENT_LABELS[paymentMethod] : '-'}
        </span>
      </div>
      {service && (
        <div className="flex justify-between items-center p-4 bg-rose-50/50 dark:bg-rose-dark/10">
          <span className="text-base font-semibold text-rose dark:text-rose-light">Valor</span>
          <span className="text-xl font-bold text-rose dark:text-rose-light">
            {formatPrice(service.price)}
          </span>
        </div>
      )}
    </div>
  )
}
