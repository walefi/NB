import { useState, useEffect } from 'react'
import type { Service } from '@/types'
import { fetchServices } from '@/lib/firebase/services'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchServices()
      .then((data) => {
        if (!cancelled) {
          setServices(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar servicos.'
          )
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { services, loading, error }
}
