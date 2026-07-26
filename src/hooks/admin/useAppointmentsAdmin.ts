import { useState, useEffect, useMemo } from 'react'
import { collection, query, orderBy, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db, firebaseReady } from '@/lib/firebase/config'
import { APPOINTMENT_STATUS, type AppointmentStatus } from '@/constants/appointment-status'
import type { Appointment } from '@/types'

interface UseAppointmentsAdminProps {
  dateFilter?: string
  statusFilter?: AppointmentStatus | 'all'
  searchQuery?: string
  serviceFilter?: string
}

export function useAppointmentsAdmin({
  dateFilter,
  statusFilter,
  searchQuery,
  serviceFilter,
}: UseAppointmentsAdminProps = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapDoc = (docData: DocumentData, id: string): Appointment => {
    const data = docData.data?.() ?? docData
    const time = data.time ?? data.startTime ?? ''
    const duration = data.serviceDuration ?? 60
    const [h, m] = time.split(':').map(Number)
    const endTotal = h * 60 + m + duration
    const endTime = data.endTime ?? `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`
    return {
      id,
      serviceId: data.serviceId ?? '',
      serviceName: data.serviceName ?? '',
      servicePrice: data.servicePrice ?? 0,
      serviceDuration: duration,
      clientName: data.clientName ?? '',
      clientPhone: data.clientPhone ?? '',
      clientEmail: data.clientEmail ?? undefined,
      date: data.date ?? '',
      time,
      startTime: data.startTime ?? time,
      endTime,
      paymentMethod: data.paymentMethod ?? 'to_combine',
      paymentStatus: data.paymentStatus ?? 'pending',
      notes: data.notes ?? undefined,
      status: data.status ?? APPOINTMENT_STATUS.CONFIRMED,
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? undefined,
    }
  }

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
      const data = snapshot.docs.map((doc) => mapDoc(doc, doc.id))
      setAppointments(data)
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (dateFilter && apt.date !== dateFilter) return false
      if (statusFilter && statusFilter !== 'all' && apt.status !== statusFilter) return false
      if (serviceFilter && apt.serviceId !== serviceFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!apt.clientName.toLowerCase().includes(q)) return false
        if (!apt.clientPhone.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [appointments, dateFilter, statusFilter, searchQuery, serviceFilter])

  const stats = useMemo(() => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const todayAppointments = filteredAppointments.filter((a) => a.date === today && a.status !== APPOINTMENT_STATUS.CANCELLED)
    const confirmed = filteredAppointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED)
    const completed = filteredAppointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED)
    const cancelled = filteredAppointments.filter((a) => a.status === APPOINTMENT_STATUS.CANCELLED)
    const noShow = filteredAppointments.filter((a) => a.status === APPOINTMENT_STATUS.NO_SHOW)
    const estimatedRevenue = filteredAppointments
      .filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED)
      .reduce((sum, a) => sum + a.servicePrice, 0)

    return {
      total: filteredAppointments.length,
      today: todayAppointments.length,
      confirmed,
      completed,
      cancelled,
      noShow,
      estimatedRevenue,
    }
  }, [filteredAppointments])

  return {
    appointments: filteredAppointments,
    loading,
    error,
    stats,
  }
}