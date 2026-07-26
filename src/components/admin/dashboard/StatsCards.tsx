import { CalendarCheck, CheckCircle, DollarSign, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import { APPOINTMENT_STATUS } from '@/constants/appointment-status'
import type { Appointment } from '@/types'

interface StatsCardsProps {
  appointments: Appointment[]
}

export function StatsCards({ appointments }: StatsCardsProps) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const todayAppointments = appointments.filter(
    (a) => a.date === today && a.status !== APPOINTMENT_STATUS.CANCELLED
  )
  const confirmed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED)
  const completed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED)
  const cancelled = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CANCELLED)

  const estimatedRevenue = appointments
    .filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED)
    .reduce((sum, a) => sum + a.servicePrice, 0)

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: CalendarCheck,
      color: 'bg-rose-50 dark:bg-rose-dark/20 text-rose dark:text-rose-light',
    },
    {
      label: 'Confirmados',
      value: confirmed.length,
      icon: CheckCircle,
      color: 'bg-rose-100 dark:bg-rose-dark/30 text-rose-dark dark:text-rose-light',
    },
    {
      label: 'Concluidos',
      value: completed.length,
      icon: Users,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    },
    {
      label: 'Cancelados',
      value: cancelled.length,
      icon: CalendarCheck,
      color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    },
    {
      label: 'Receita Estimada',
      value: formatPrice(estimatedRevenue),
      icon: DollarSign,
      color: 'bg-pink-50 dark:bg-pink-dark/20 text-rose dark:text-rose-light',
      isCurrency: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-start gap-3 p-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-black/50 dark:text-white/50 mb-1">{stat.label}</p>
            <p className={`font-bold text-black dark:text-white text-base ${stat.isCurrency ? 'text-sm' : 'text-xl'}`}>
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}