import { CalendarCheck, DollarSign, Users, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { Appointment } from '@/types'

interface StatsCardsProps {
  appointments: Appointment[]
}

export function StatsCards({ appointments }: StatsCardsProps) {
  const today = new Date().toISOString().split('T')[0]

  const todayAppointments = appointments.filter(
    (a) => a.date === today && a.status !== 'cancelled'
  )

  const pending = appointments.filter((a) => a.status === 'pending')
  const confirmed = appointments.filter((a) => a.status === 'confirmed')
  const totalActive = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'no_show'
  )

  const estimatedRevenue = totalActive.reduce((sum, a) => sum + a.servicePrice, 0)

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: CalendarCheck,
      color: 'bg-rose-50 dark:bg-rose-dark/20 text-rose dark:text-rose-light',
    },
    {
      label: 'Pendentes',
      value: pending.length,
      icon: Clock,
      color: 'bg-pink-light dark:bg-pink-dark/20 text-rose dark:text-rose-light',
    },
    {
      label: 'Confirmados',
      value: confirmed.length,
      icon: Users,
      color: 'bg-rose-100 dark:bg-rose-dark/30 text-rose-dark dark:text-rose-light',
    },
    {
      label: 'Receita Estimada',
      value: `R$ ${estimatedRevenue.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'bg-pink-50 dark:bg-pink-dark/20 text-rose dark:text-rose-light',
      isCurrency: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-black/50 dark:text-white/50 mb-1">{stat.label}</p>
            <p className={`font-bold text-black dark:text-white ${stat.isCurrency ? 'text-sm' : 'text-xl'}`}>
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
