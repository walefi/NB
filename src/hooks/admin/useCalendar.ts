import { useState, useEffect, useCallback, useMemo } from 'react'
import { collection, query, orderBy, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db, firebaseReady } from '@/lib/firebase/config'
import { getBusinessSettings } from '@/lib/firebase/settings'
import { fetchServices } from '@/lib/firebase/services'
import {
  getToday,
  getThisWeekStart,
  getThisWeekEnd,
  addDays,
  addWeeks,
  addMonths,
  getAppointmentsForDate,
  getWeekDates,
} from '@/lib/calendar/utils'
import type { Appointment, AppointmentStatus, BusinessSettings, Service } from '@/types'
import type { CalendarView } from '@/lib/calendar/utils'

export interface CalendarFilters {
  status: AppointmentStatus | 'all'
  serviceId: string
  searchQuery: string
}

export function useCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<CalendarView>('week')
  const [currentDate, setCurrentDate] = useState(getToday())
  const [filters, setFilters] = useState<CalendarFilters>({
    status: 'all',
    serviceId: '',
    searchQuery: '',
  })

  useEffect(() => {
    const loadData = async () => {
      const [s, svc] = await Promise.all([getBusinessSettings(), fetchServices()])
      setSettings(s)
      setServices(svc)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!firebaseReady || !db) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'appointments'),
      orderBy('date', 'asc'),
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
          status: d.status ?? 'pending',
          createdAt: d.createdAt ?? new Date().toISOString(),
        } as Appointment
      })
      setAppointments(data)
      setLoading(false)
    }, () => {
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (filters.status !== 'all' && apt.status !== filters.status) return false
      if (filters.serviceId && apt.serviceId !== filters.serviceId) return false
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const nameMatch = apt.clientName.toLowerCase().includes(q)
        const phoneMatch = apt.clientPhone.toLowerCase().includes(q)
        if (!nameMatch && !phoneMatch) return false
      }
      return true
    })
  }, [appointments, filters])

  const todayAppointments = useMemo(
    () => getAppointmentsForDate(getToday(), filteredAppointments),
    [filteredAppointments]
  )

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  const weekAppointments = useMemo(() => {
    const start = getThisWeekStart()
    const end = getThisWeekEnd()
    return filteredAppointments.filter((a) => a.date >= start && a.date <= end)
  }, [filteredAppointments])

  const monthAppointments = useMemo(() => {
    const d = new Date(currentDate + 'T12:00:00')
    const year = d.getFullYear()
    const month = d.getMonth()
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0]
    return filteredAppointments.filter((a) => a.date >= start && a.date <= end)
  }, [filteredAppointments, currentDate])

  const navigateToday = useCallback(() => setCurrentDate(getToday()), [])

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'day') return addDays(prev, -1)
      if (view === 'week') return addWeeks(prev, -1)
      return addMonths(prev, -1)
    })
  }, [view])

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'day') return addDays(prev, 1)
      if (view === 'week') return addWeeks(prev, 1)
      return addMonths(prev, 1)
    })
  }, [view])

  const setViewMode = useCallback((newView: CalendarView) => {
    setView(newView)
  }, [])

  const updateFilters = useCallback((updates: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  return {
    appointments: filteredAppointments,
    allAppointments: appointments,
    settings,
    services,
    loading,
    view,
    currentDate,
    filters,
    todayAppointments,
    weekDates,
    weekAppointments,
    monthAppointments,
    navigateToday,
    navigatePrev,
    navigateNext,
    setViewMode,
    updateFilters,
    setCurrentDate,
  }
}
