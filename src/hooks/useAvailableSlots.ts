import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, firebaseReady } from '@/lib/firebase/config'
import { getBusinessSettings } from '@/lib/firebase/settings'
import { getAvailableSlotsForDate } from '@/lib/availability-engine'
import { APPOINTMENT_STATUS } from '@/constants/appointment-status'
import type { DaySlots } from '@/lib/firebase/availability'
import type { Appointment, BusinessSettings } from '@/types'

function slotsToAppointments(date: string, slots: DaySlots): Appointment[] {
  return Object.entries(slots).map(([time, duration]) => ({
    id: `slot-${time}`,
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    serviceDuration: duration,
    clientName: '',
    clientPhone: '',
    date,
    time,
    paymentMethod: 'to_combine',
    status: APPOINTMENT_STATUS.CONFIRMED,
    createdAt: '',
  }))
}

/**
 * Real-time hook that returns available time slots for a given date and service duration.
 * Reads the day occupancy from `availability/{date}`, the collection that holds
 * no client PII and is therefore readable without authentication.
 */
export function useAvailableSlots(
  date: string | null,
  serviceDuration: number
) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Load business settings once
  useEffect(() => {
    let cancelled = false
    getBusinessSettings().then((s) => {
      if (!cancelled) setSettings(s)
    })
    return () => { cancelled = true }
  }, [])

  // Real-time occupancy subscription for the selected date
  useEffect(() => {
    if (!date) {
      setAppointments([])
      setLoading(false)
      return
    }

    if (!firebaseReady || !db) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = onSnapshot(
      doc(db, 'availability', date),
      (snapshot) => {
        const data = snapshot.data() as { slots?: DaySlots } | undefined
        setAppointments(slotsToAppointments(date, data?.slots ?? {}))
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [date])

  const availableSlots = useMemo(() => {
    if (!date || !settings) return []
    return getAvailableSlotsForDate(date, settings, appointments, serviceDuration)
  }, [date, settings, appointments, serviceDuration])

  return { availableSlots, loading, settings }
}
