import type { Appointment, BusinessSettings, DaySchedule, BreakInterval, DateBlock, TimeBlock } from '@/types'

interface Slot {
  date: string
  time: string
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

/** Get schedule for a day */
export function getDaySchedule(date: string, settings: BusinessSettings | null): DaySchedule {
  if (!settings) return { open: true, startTime: '09:00', endTime: '19:00' }
  const dateObj = new Date(date + 'T12:00:00')
  const dayKey = DAY_KEYS[dateObj.getDay()]
  return settings.businessHours[dayKey] ?? { open: false, startTime: '09:00', endTime: '19:00' }
}

/** Check date blocks */
export function isDateBlocked(date: string, settings: BusinessSettings | null): boolean {
  if (!settings) return false
  return (settings.dateBlocks || []).some((b: DateBlock) => b.date === date)
}

/** Check time blocks */
export function isTimeBlocked(date: string, time: string, settings: BusinessSettings | null): boolean {
  if (!settings) return false
  return (settings.timeBlocks || []).some((b: TimeBlock) => b.date === date && b.time === time)
}

/** Check break intervals */
export function isBreakTime(time: string, breaks: BreakInterval[]): boolean {
  return breaks.some((br) => time >= br.startTime && time < br.endTime)
}

/** Calculate end time for a slot */
export function calculateAppointmentEnd(_date: string, time: string, duration: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + duration
  const endH = Math.floor(total / 60)
  const endM = total % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

/** Check if a candidate time overlaps with any existing appointment */
function hasOverlap(
  date: string,
  time: string,
  serviceDuration: number,
  appointments: Appointment[]
): boolean {
  const newStart = timeToMinutes(time)
  const newEnd = newStart + serviceDuration

  return appointments.some((a) => {
    if (a.date !== date) return false
    if (a.status === 'cancelled') return false
    const aStart = timeToMinutes(a.time)
    const aEnd = aStart + a.serviceDuration
    return newStart < aEnd && newEnd > aStart
  })
}

/** Convert "HH:mm" to minutes since midnight */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Core: check if a slot is available for a given service duration.
 * Considers: date blocks, time blocks, business hours, breaks, and
 * duration-aware overlap with all non-cancelled appointments.
 */
export function isSlotAvailable(
  date: string,
  time: string,
  settings: BusinessSettings | null,
  appointments: Appointment[],
  serviceDuration: number
): boolean {
  if (isDateBlocked(date, settings)) return false
  if (isTimeBlocked(date, time, settings)) return false

  const schedule = getDaySchedule(date, settings)
  if (!schedule.open) return false
  if (time < schedule.startTime) return false

  const slotEnd = calculateAppointmentEnd(date, time, serviceDuration)
  if (slotEnd > schedule.endTime) return false

  if (settings?.breaks && isBreakTime(time, settings.breaks)) return false

  if (hasOverlap(date, time, serviceDuration, appointments)) return false

  return true
}

/** Generate all available slots for a date (pure, no network) */
export function getAvailableSlotsForDate(
  date: string,
  settings: BusinessSettings | null,
  appointments: Appointment[],
  serviceDuration: number
): string[] {
  const schedule = getDaySchedule(date, settings)
  if (!schedule.open) return []

  const slots: string[] = []
  const startMinutes = timeToMinutes(schedule.startTime)
  const endMinutes = timeToMinutes(schedule.endTime)

  for (let m = startMinutes; m + serviceDuration <= endMinutes; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    const time = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`

    if (isSlotAvailable(date, time, settings, appointments, serviceDuration)) {
      slots.push(time)
    }
  }

  return slots
}

/** Generate all available slots for a date range */
export function getAvailableSlots(
  settings: BusinessSettings | null,
  appointments: Appointment[],
  serviceDuration: number,
  _breaks: BreakInterval[] = [],
  dateRange: { start: string; end: string }
): Slot[] {
  const start = new Date(dateRange.start + 'T00:00:00')
  const end = new Date(dateRange.end + 'T00:00:00')
  const slots: Slot[] = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10)
    const available = getAvailableSlotsForDate(dateStr, settings, appointments, serviceDuration)
    for (const time of available) {
      slots.push({ date: dateStr, time })
    }
  }

  return slots
}

/** Find the next free slot after a given slot */
export function getNextAvailableSlot(
  after: Slot,
  settings: BusinessSettings | null,
  appointments: Appointment[],
  serviceDuration: number
): Slot | null {
  const startDate = new Date(after.date + 'T00:00:00')

  for (let d = new Date(startDate); ; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10)
    const schedule = getDaySchedule(dateStr, settings)
    if (!schedule.open) continue

    const startMinutes = timeToMinutes(schedule.startTime)
    const endMinutes = timeToMinutes(schedule.endTime)

    for (let m = startMinutes; m + serviceDuration <= endMinutes; m += 30) {
      const h = Math.floor(m / 60)
      const min = m % 60
      const time = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`

      if (dateStr < after.date || (dateStr === after.date && time <= after.time)) continue

      if (isSlotAvailable(dateStr, time, settings, appointments, serviceDuration)) {
        return { date: dateStr, time }
      }
    }
  }
}

export const AvailabilityEngine = {
  getDaySchedule,
  isDateBlocked,
  isTimeBlocked,
  isBreakTime,
  calculateAppointmentEnd,
  isSlotAvailable,
  getAvailableSlotsForDate,
  getAvailableSlots,
  getNextAvailableSlot,
}
