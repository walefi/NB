import { doc, getDoc, runTransaction, type Transaction } from 'firebase/firestore'
import { db, firebaseReady } from './config'

/**
 * Occupied time slots of a single day.
 * Shape: { "09:00": 60, "10:30": 45 } -> time (HH:MM) -> duration in minutes.
 *
 * This is the ONLY booking data the public flow is allowed to read, because
 * it carries no client PII. The `appointments` collection keeps the PII and
 * stays admin-only.
 */
export type DaySlots = Record<string, number>

const AVAILABILITY_COLLECTION = 'availability'

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** True when [time, time+duration] overlaps any already occupied slot. */
export function hasSlotConflict(slots: DaySlots, time: string, duration: number): boolean {
  const newStart = timeToMinutes(time)
  const newEnd = newStart + duration
  return Object.entries(slots).some(([slotTime, slotDuration]) => {
    const slotStart = timeToMinutes(slotTime)
    const slotEnd = slotStart + (slotDuration || 0)
    return newStart < slotEnd && newEnd > slotStart
  })
}

function readSlotsFromData(data: unknown): DaySlots {
  if (!data || typeof data !== 'object') return {}
  const slots = (data as { slots?: unknown }).slots
  if (!slots || typeof slots !== 'object') return {}
  return slots as DaySlots
}

/**
 * Reads the occupied slots of a day. Public read, no authentication needed.
 * Returns an empty map when the day has no document yet or the read failed.
 */
export async function fetchDaySlots(date: string): Promise<DaySlots> {
  if (!firebaseReady || !db) return {}
  try {
    const snap = await getDoc(doc(db, AVAILABILITY_COLLECTION, date))
    if (!snap.exists()) return {}
    return readSlotsFromData(snap.data())
  } catch {
    return {}
  }
}

/**
 * Transactional read of the occupied slots of a day.
 * MUST be called before any write in the same transaction: because every
 * booking of a day lives in a single document, this read makes concurrent
 * bookings for that day serialise. Firestore retries the transaction when the
 * document changed in between, so the loser sees the winner's slot.
 */
export async function readDaySlots(
  transaction: Transaction,
  date: string
): Promise<DaySlots> {
  const snap = await transaction.get(doc(db!, AVAILABILITY_COLLECTION, date))
  if (!snap.exists()) return {}
  return readSlotsFromData(snap.data())
}

/**
 * Transactional write of the occupied slots of a day.
 * `slots` must be the map returned by `readDaySlots` plus the new entry.
 */
export function writeDaySlots(
  transaction: Transaction,
  date: string,
  slots: DaySlots
): void {
  transaction.set(doc(db!, AVAILABILITY_COLLECTION, date), {
    date,
    slots,
    updatedAt: new Date().toISOString(),
  })
}

/** Admin only: replaces the whole day. Used to rebuild a day from scratch. */
export async function setDaySlots(date: string, slots: DaySlots): Promise<void> {
  if (!firebaseReady || !db) return
  try {
    await runTransaction(db, async (transaction) => {
      writeDaySlots(transaction, date, slots)
    })
  } catch {
    // Non fatal: the appointment itself was already saved.
  }
}

/**
 * Admin only: makes sure every occupied slot of the given appointments is
 * also present in the `availability` collection. Used to backfill the days
 * that were booked before this collection existed.
 * Only adds missing slots, it never frees one, so it can never race with a
 * booking that is being created right now.
 */
export async function ensureSlotsForBookings(
  bookings: { date: string; time: string; duration: number }[]
): Promise<number> {
  if (!firebaseReady || !db) return 0

  const byDate = new Map<string, DaySlots>()
  for (const booking of bookings) {
    if (!booking.date || !booking.time) continue
    const slots = byDate.get(booking.date) ?? {}
    if (!(booking.time in slots)) {
      slots[booking.time] = booking.duration
      byDate.set(booking.date, slots)
    }
  }

  let created = 0
  for (const [date, incoming] of byDate) {
    const current = await fetchDaySlots(date)
    const missing = Object.entries(incoming).filter(([time]) => !(time in current))
    if (missing.length === 0) continue
    const next: DaySlots = { ...current }
    for (const [time, duration] of missing) {
      next[time] = duration
      created++
    }
    await setDaySlots(date, next)
  }
  return created
}
