import { useState, useEffect, useMemo } from 'react'
import { collection, query, orderBy, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db, firebaseReady } from '@/lib/firebase/config'
import type { Appointment, AppointmentStatus } from '@/types'

interface UseAppointmentsAdminProps {
  dateFilter?: string
  statusFilter?: AppointmentStatus | 'all'
  searchQuery?: string
}

export function useAppointmentsAdmin({
  dateFilter,
  statusFilter,
  searchQuery,
}: UseAppointmentsAdminProps = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapDoc = (doc: DocumentData, id: string): Appointment => {
    const data = doc.data?.() ?? doc
    return {
      id,
      serviceId: data.serviceId ?? '',
      serviceName: data.serviceName ?? '',
      servicePrice: data.servicePrice ?? 0,
      serviceDuration: data.serviceDuration ?? 60,
      clientName: data.clientName ?? '',
      clientPhone: data.clientPhone ?? '',
      date: data.date ?? '',
      time: data.time ?? '',
      paymentMethod: data.paymentMethod ?? 'to_combine',
      notes: data.notes ?? undefined,
      status: data.status ?? 'pending',
      createdAt: data.createdAt ?? new Date().toISOString(),
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
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!apt.clientName.toLowerCase().includes(q)) return false
        if (!apt.clientPhone.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [appointments, dateFilter, statusFilter, searchQuery])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = filteredAppointments.filter((a) => a.date === today && a.status !== 'cancelled')
    const pending = filteredAppointments.filter((a) => a.status === 'pending')
    const confirmed = filteredAppointments.filter((a) => a.status === 'confirmed')
    const completed = filteredAppointments.filter((a) => a.status === 'completed')
    const cancelled = filteredAppointments.filter((a) => a.status === 'cancelled')
    const noShow = filteredAppointments.filter((a) => a.status === 'no_show')
    const estimatedRevenue = filteredAppointments
      .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
      .reduce((sum, a) => sum + a.servicePrice, 0)

    return {
      total: filteredAppointments.length,
      today: todayAppointments.length,
      pending,
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