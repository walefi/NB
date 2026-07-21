import { Banknote, CreditCard, Wallet, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PAYMENT_METHODS } from '@/constants'
import type { PaymentMethod } from '@/types'

interface PaymentSelectorProps {
  selected: PaymentMethod | ''
  onSelect: (method: PaymentMethod) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pix: Banknote,
  card: CreditCard,
  cash: Wallet,
  to_combine: MessageCircle,
}

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PAYMENT_METHODS.map(({ value, label }, i) => {
        const Icon = iconMap[value]
        return (
          <Card
            key={value}
            selected={selected === value}
            onClick={() => onSelect(value as PaymentMethod)}
            className={`animate-fade-in stagger-${i + 1}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  selected === value
                    ? 'bg-rose text-white'
                    : 'bg-rose-50 dark:bg-rose-dark/20 text-rose dark:text-rose-light'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-black dark:text-white">
                {label}
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
