import { memo, useState } from 'react'
import { Plus, Trash2, Coffee, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings, BreakInterval } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

export const BreaksEditor = memo(function BreaksEditor({ settings, onSave, saving }: Props) {
  const [breaks, setBreaks] = useState<BreakInterval[]>(settings.breaks || [])

  const addBreak = () => {
    setBreaks((prev) => [
      ...prev,
      { id: Date.now().toString(), startTime: '12:00', endTime: '13:00', label: 'Almoco' },
    ])
  }

  const removeBreak = (id: string) => {
    setBreaks((prev) => prev.filter((b) => b.id !== id))
  }

  const updateBreak = (id: string, field: keyof BreakInterval, value: string) => {
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  const handleSave = async () => {
    await onSave({ breaks })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Horarios de intervalo nao aparecem para o cliente no agendamento.
      </p>

      <div className="space-y-3">
        {breaks.map((br) => (
          <div
            key={br.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900"
          >
            <Coffee className="w-4 h-4 text-rose shrink-0" />
            <input
              type="text"
              value={br.label}
              onChange={(e) => updateBreak(br.id, 'label', e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="Ex: Almoco"
            />
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={br.startTime}
                onChange={(e) => updateBreak(br.id, 'startTime', e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
              />
              <span className="text-gray-400">as</span>
              <input
                type="time"
                value={br.endTime}
                onChange={(e) => updateBreak(br.id, 'endTime', e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
              />
            </div>
            <button
              type="button"
              onClick={() => removeBreak(br.id)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={addBreak} className="flex items-center gap-2 text-rose">
          <Plus className="w-4 h-4" />
          Adicionar Intervalo
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
})
