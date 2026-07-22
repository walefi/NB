import type { Appointment, AppointmentStatus, BusinessSettings, DaySchedule, BreakInterval, DateBlock, TimeBlock } from '@/types'

export type CalendarView = 'day' | 'week' | 'month'

export interface TimeSlotData {
  time: string
  hour: number
  minute: number
  isBreak: boolean
  isBlocked: boolean
  isClosed: boolean
  isOutsideHours: boolean
  appointment: Appointment | null
}

export interface DayData {
  date: string
  dayOfWeek: string
  dayNumber: number
  isToday: boolean
  isPast: boolean
  isClosed: boolean
  isBlocked: boolean
  appointments: Appointment[]
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
const DAY_NAMES_PT = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado']
const DAY_NAMES_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
const MONTH_NAMES_PT = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export function getStatusColor(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    pending: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300',
    confirmed: 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
    cancelled: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
    completed: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300',
    no_show: 'bg-gray-100 border-gray-400 text-gray-800 dark:bg-gray-800/30 dark:border-gray-500 dark:text-gray-300',
  }
  return colors[status] || colors.pending
}

export function getStatusBg(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    pending: 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    confirmed: 'border-l-green-400 bg-green-50 dark:bg-green-900/20',
    cancelled: 'border-l-red-400 bg-red-50 dark:bg-red-900/20',
    completed: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/20',
    no_show: 'border-l-gray-400 bg-gray-50 dark:bg-gray-800/20',
  }
  return colors[status] || colors.pending
}

export function getStatusDot(status: AppointmentStatus): string {
  const dots: Record<AppointmentStatus, string> = {
    pending: 'bg-yellow-400',
    confirmed: 'bg-green-400',
    cancelled: 'bg-red-400',
    completed: 'bg-blue-400',
    no_show: 'bg-gray-400',
  }
  return dots[status] || dots.pending
}

export function getStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Concluido',
    no_show: 'Nao compareceu',
  }
  return labels[status] || status
}

export function generateTimeSlots(startHour = 8, endHour = 20): string[] {
  const slots: string[] = []
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < endHour) {
      slots.push(`${String(h).padStart(2, '0')}:30`)
    }
  }
  return slots
}

export function getDaySchedule(date: string, settings: BusinessSettings | null): DaySchedule {
  if (!settings) return { open: true, startTime: '09:00', endTime: '19:00' }
  const dateObj = new Date(date + 'T12:00:00')
  const dayKey = DAY_KEYS[dateObj.getDay()]
  return settings.businessHours[dayKey] || { open: false, startTime: '09:00', endTime: '19:00' }
}

export function isDateBlocked(date: string, settings: BusinessSettings | null): boolean {
  if (!settings) return false
  return (settings.dateBlocks || []).some((b: DateBlock) => b.date === date)
}

export function isTimeBlocked(date: string, time: string, settings: BusinessSettings | null): boolean {
  if (!settings) return false
  return (settings.timeBlocks || []).some((b: TimeBlock) => b.date === date && b.time === time)
}

export function isBreakTime(time: string, breaks: BreakInterval[]): boolean {
  return breaks.some((b) => time >= b.startTime && time < b.endTime)
}

export function isSlotAvailable(date: string, time: string, settings: BusinessSettings | null, appointments: Appointment[]): boolean {
  if (isDateBlocked(date, settings)) return false
  if (isTimeBlocked(date, time, settings)) return false

  const schedule = getDaySchedule(date, settings)
  if (!schedule.open) return false

  if (time < schedule.startTime || time >= schedule.endTime) return false

  if (settings?.breaks && isBreakTime(time, settings.breaks)) return false

  const hasConflict = appointments.some(
    (a) => a.date === date && a.time === time && a.status !== 'cancelled'
  )
  return !hasConflict
}

export function getAppointmentsForSlot(date: string, time: string, appointments: Appointment[]): Appointment[] {
  return appointments.filter((a) => a.date === date && a.time === time && a.status !== 'cancelled')
}

export function getAppointmentsForDate(date: string, appointments: Appointment[]): Appointment[] {
  return appointments
    .filter((a) => a.date === date && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function getAppointmentHeight(duration: number, slotHeight = 48): number {
  const slots = Math.ceil(duration / 30)
  return slots * slotHeight - 4
}

export function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return `${DAY_NAMES_PT[d.getDay()]}, ${d.getDate()} de ${MONTH_NAMES_PT[d.getMonth()]}`
}

export function formatDateShort(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function formatTimeRange(startTime: string, duration: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const endMinutes = h * 60 + m + duration
  const endH = Math.floor(endMinutes / 60)
  const endM = endMinutes % 60
  return `${startTime} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

export function getWeekDates(dateStr: string): string[] {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    dates.push(dd.toISOString().split('T')[0])
  }
  return dates
}

export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startPad = (firstDay.getDay() + 6) % 7
  const paddedStart = new Date(firstDay)
  paddedStart.setDate(firstDay.getDate() - startPad)

  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7
  for (let i = 0; i < totalCells; i++) {
    const dd = new Date(paddedStart)
    dd.setDate(paddedStart.getDate() + i)
    dates.push(dd.toISOString().split('T')[0])
  }
  return dates
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}

export function isToday(date: string): boolean {
  return date === new Date().toISOString().split('T')[0]
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function getThisWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return monday.toISOString().split('T')[0]
}

export function getThisWeekEnd(): string {
  const start = getThisWeekStart()
  const d = new Date(start + 'T12:00:00')
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function addWeeks(dateStr: string, weeks: number): string {
  return addDays(dateStr, weeks * 7)
}

export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

export function getDayNameShort(date: string): string {
  const d = new Date(date + 'T12:00:00')
  return DAY_NAMES_SHORT[d.getDay()]
}

export function getMonthYear(dateStr: string): { month: string; year: number } {
  const d = new Date(dateStr + 'T12:00:00')
  return { month: MONTH_NAMES_PT[d.getMonth()], year: d.getFullYear() }
}

export function getDayNumber(date: string): number {
  return new Date(date + 'T12:00:00').getDate()
}
