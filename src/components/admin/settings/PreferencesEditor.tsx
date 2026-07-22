import { memo, useState } from 'react'
import { Settings, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings, BusinessPreferences } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

export const PreferencesEditor = memo(function PreferencesEditor({ settings, onSave, saving }: Props) {
  const [prefs, setPrefs] = useState<BusinessPreferences>(settings.preferences)

  const update = (field: keyof BusinessPreferences, value: string) => {
    setPrefs((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    await onSave({ preferences: prefs })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <Settings className="w-4 h-4 text-rose" />
            Tema
          </label>
          <select
            value={prefs.theme}
            onChange={(e) => update('theme', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
          >
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">Idioma</label>
          <select
            value={prefs.language}
            onChange={(e) => update('language', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
          >
            <option value="pt-BR">Portugues (Brasil)</option>
            <option value="en">English</option>
            <option value="es">Espanol</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">Moeda</label>
          <select
            value={prefs.currency}
            onChange={(e) => update('currency', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
          >
            <option value="BRL">BRL (R$)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (E)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">Formato de data</label>
          <select
            value={prefs.dateFormat}
            onChange={(e) => update('dateFormat', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
          >
            <option value="dd/MM/yyyy">DD/MM/AAAA</option>
            <option value="MM/dd/yyyy">MM/DD/AAAA</option>
            <option value="yyyy-MM-dd">AAAA-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">Formato de hora</label>
          <select
            value={prefs.timeFormat}
            onChange={(e) => update('timeFormat', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
          >
            <option value="HH:mm">24 horas (14:00)</option>
            <option value="hh:mm a">12 horas (2:00 PM)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Preferencias'}
        </Button>
      </div>
    </div>
  )
})
