import { useState, useCallback, useEffect } from 'react'
import type { Appointment, AppointmentStatus } from '@/types'
import {
  fetchAppointments,
  updateAppointmentStatus,
} from '@/lib/firebase/appointments'

export function useAppointments(dateFilter?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAppointments(dateFilter)
      setAppointments(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar agendamentos.'
      )
    } finally {
      setLoading(false)
    }
  }, [dateFilter])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      try {
        await updateAppointmentStatus(id, status)
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        )
      } catch {
        // keep current state on error
      }
    },
    []
  )

  return { appointments, loading, error, reload: load, updateStatus }
}
