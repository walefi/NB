import { useState, useEffect, useCallback } from 'react'
import { getBusinessSettings, saveBusinessSettings } from '@/lib/firebase/settings'
import type { BusinessSettings } from '@/types'

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getBusinessSettings()
    setSettings(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(async (data: Partial<BusinessSettings>) => {
    setSaving(true)
    const ok = await saveBusinessSettings(data)
    if (ok) {
      setSettings((prev) =>
        prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null
      )
    }
    setSaving(false)
    return ok
  }, [])

  return { settings, loading, saving, save, reload: load }
}
