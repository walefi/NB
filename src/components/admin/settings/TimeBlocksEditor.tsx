import { memo, useState } from 'react'
import { Plus, Trash2, Clock, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings, TimeBlock } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

export const TimeBlocksEditor = memo(function TimeBlocksEditor({ settings, onSave, saving }: Props) {
  const [blocks, setBlocks] = useState<TimeBlock[]>(settings.timeBlocks || [])
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('09:00')
  const [newReason, setNewReason] = useState('')

  const addBlock = () => {
    if (!newDate || !newTime) return
    setBlocks((prev) => [
      ...prev,
      { id: Date.now().toString(), date: newDate, time: newTime, reason: newReason },
    ])
    setNewReason('')
  }

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const handleSave = async () => {
    await onSave({ timeBlocks: blocks })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Bloqueie horarios especificos em datas pontuais.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose shrink-0" />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
          />
        </div>
        <input
          type="text"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-rose"
          placeholder="Motivo (ex: Cliente VIP)"
        />
        <Button onClick={addBlock} disabled={!newDate || !newTime} className="flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Bloquear
        </Button>
      </div>

      <div className="space-y-2">
        {blocks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum horario bloqueado</p>
        )}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900"
          >
            <Clock className="w-4 h-4 text-rose shrink-0" />
            <span className="text-sm font-medium text-black dark:text-white min-w-[100px]">
              {new Date(block.date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </span>
            <span className="text-sm text-black dark:text-white font-mono">{block.time}</span>
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
