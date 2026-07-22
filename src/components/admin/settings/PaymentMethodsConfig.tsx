import { memo, useState } from 'react'
import { CreditCard, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings, PaymentMethodConfig } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

export const PaymentMethodsConfig = memo(function PaymentMethodsConfig({ settings, onSave, saving }: Props) {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(settings.paymentMethods || [])

  const toggleMethod = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    )
  }

  const updateLabel = (id: string, label: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, label } : m))
    )
  }

  const handleSave = async () => {
    await onSave({ paymentMethods: methods })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Escolha quais formas de pagamento aparecem para o cliente.
      </p>

      <div className="space-y-2">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900"
          >
            <CreditCard className="w-4 h-4 text-rose shrink-0" />
            <input
              type="text"
              value={method.label}
              onChange={(e) => updateLabel(method.id, e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
            />
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={method.enabled}
                onChange={() => toggleMethod(method.id)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose" />
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Formas de Pagamento'}
        </Button>
      </div>
    </div>
  )
})
