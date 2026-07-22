import { memo, useState } from 'react'
import { Shield, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings, BusinessPolicies } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

export const PoliciesEditor = memo(function PoliciesEditor({ settings, onSave, saving }: Props) {
  const [policies, setPolicies] = useState<BusinessPolicies>(settings.policies)

  const update = (field: keyof BusinessPolicies, value: string | number | boolean) => {
    setPolicies((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    await onSave({ policies })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <Shield className="w-4 h-4 text-rose" />
            Minimo de antecedencia (horas)
          </label>
          <input
            type="number"
            value={policies.minAdvanceHours}
            onChange={(e) => update('minAdvanceHours', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            min={0}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">
            Maximo de antecedencia (dias)
          </label>
          <input
            type="number"
            value={policies.maxAdvanceDays}
            onChange={(e) => update('maxAdvanceDays', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            min={1}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">
            Cancelar ate (horas antes)
          </label>
          <input
            type="number"
            value={policies.cancelBeforeHours}
            onChange={(e) => update('cancelBeforeHours', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            min={0}
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={policies.rescheduleAllowed}
              onChange={(e) => update('rescheduleAllowed', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose" />
          </label>
          <span className="text-sm font-medium text-black dark:text-white">Reagendamento permitido</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">
            Mensagem de confirmacao
          </label>
          <textarea
            value={policies.confirmationMessage}
            onChange={(e) => update('confirmationMessage', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            rows={2}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-black dark:text-white mb-1 block">
            Mensagem de cancelamento
          </label>
          <textarea
            value={policies.cancellationMessage}
            onChange={(e) => update('cancellationMessage', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Politicas'}
        </Button>
      </div>
    </div>
  )
})
