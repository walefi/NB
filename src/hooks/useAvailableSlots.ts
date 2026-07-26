import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, orderBy, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db, firebaseReady } from '@/lib/firebase/config'
import { getBusinessSettings } from '@/lib/firebase/settings'
import { getAvailableSlotsForDate } from '@/lib/availability-engine'
import type { Appointment, BusinessSettings } from '@/types'

/**
 * Real-time hook that returns available time slots for a given date and service duration.
 * Uses onSnapshot so slots update immediately when appointments are created/cancelled/deleted.
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

  // Real-time appointment subscription for the selected date
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
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', date),
      orderBy('time', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc: DocumentData) => {
        const d = doc.data()
        return {
          id: doc.id,
          serviceId: d.serviceId ?? '',
          serviceName: d.serviceName ?? '',
          servicePrice: d.servicePrice ?? 0,
          serviceDuration: d.serviceDuration ?? 60,
          clientName: d.clientName ?? '',
          clientPhone: d.clientPhone ?? '',
          date: d.date ?? '',
          time: d.time ?? '',
          paymentMethod: d.paymentMethod ?? 'to_combine',
          notes: d.notes ?? undefined,
          status: d.status ?? 'confirmed',
          createdAt: d.createdAt ?? new Date().toISOString(),
        } as Appointment
      })
      setAppointments(data)
      setLoading(false)
    }, () => {
      setLoading(false)
    })

    return () => unsubscribe()
  }, [date])

  const availableSlots = useMemo(() => {
    if (!date || !settings) return []
    return getAvailableSlotsForDate(date, settings, appointments, serviceDuration)
  }, [date, settings, appointments, serviceDuration])

  return { availableSlots, loading, settings }
}
