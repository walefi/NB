import { memo, useState } from 'react'
import { Plus, Trash2, CalendarX, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings, DateBlock } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

const BLOCK_TYPES = [
  { value: 'vacation', label: 'Ferias' },
  { value: 'course', label: 'Curso' },
  { value: 'holiday', label: 'Feriado' },
  { value: 'external', label: 'Atendimento Externo' },
  { value: 'day_off', label: 'Folga' },
  { value: 'other', label: 'Outro' },
] as const

export const DateBlocksEditor = memo(function DateBlocksEditor({ settings, onSave, saving }: Props) {
  const [blocks, setBlocks] = useState<DateBlock[]>(settings.dateBlocks || [])
  const [newDate, setNewDate] = useState('')
  const [newType, setNewType] = useState<DateBlock['type']>('vacation')
  const [newReason, setNewReason] = useState('')

  const addBlock = () => {
    if (!newDate) return
    setBlocks((prev) => [
      ...prev,
      { id: Date.now().toString(), date: newDate, type: newType, reason: newReason },
    ])
    setNewDate('')
    setNewReason('')
  }

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const handleSave = async () => {
    await onSave({ dateBlocks: blocks })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Dias bloqueados nao aparecem no calendario de agendamento do cliente.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as DateBlock['type'])}
          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
        >
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-rose"
          placeholder="Motivo (opcional)"
        />
        <Button onClick={addBlock} disabled={!newDate} className="flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Bloquear
        </Button>
      </div>

      <div className="space-y-2">
        {blocks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum dia bloqueado</p>
        )}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900"
          >
            <CalendarX className="w-4 h-4 text-rose shrink-0" />
            <span className="text-sm font-medium text-black dark:text-white min-w-[100px]">
              {new Date(block.date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-dark/20 text-rose">
              {BLOCK_TYPES.find((t) => t.value === block.type)?.label || block.type}
            </span>
            {block.reason && (
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{block.reason}</span>
            )}
            <button
              type="button"
              onClick={() => removeBlock(block.id)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Bloqueios'}
        </Button>
      </div>
    </div>
  )
})
