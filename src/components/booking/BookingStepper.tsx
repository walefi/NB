import { Check } from 'lucide-react'
import type { BookingStep } from '@/types'

const STEPS: { key: BookingStep; label: string }[] = [
  { key: 1, label: 'Servico' },
  { key: 2, label: 'Data' },
  { key: 3, label: 'Horario' },
  { key: 4, label: 'Dados' },
  { key: 5, label: 'Pagamento' },
  { key: 6, label: 'Revisao' },
  { key: 7, label: 'Pronto' },
]

interface BookingStepperProps {
  currentStep: BookingStep
  onStepClick?: (step: BookingStep) => void
}

export function BookingStepper({ currentStep, onStepClick }: BookingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-8 overflow-x-auto px-1 pb-1">
      {STEPS.map((step, i) => {
        const completed = currentStep > step.key
        const active = currentStep === step.key
        return (
          <div key={step.key} className="flex items-center shrink-0">
            <button
              onClick={() => {
                if (completed) onStepClick?.(step.key)
              }}
              disabled={!completed && !active}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                completed
                  ? 'bg-rose/15 dark:bg-rose-dark/20 text-rose dark:text-rose-light cursor-pointer hover:bg-rose/25'
                  : active
                    ? 'bg-rose text-white shadow-md shadow-rose/20 scale-105'
                    : 'bg-rose-50 dark:bg-rose-dark/10 text-rose/30 dark:text-rose-light/25 cursor-default'
              }`}
            >
              {completed ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="w-3 h-3 flex items-center justify-center text-[9px]">
                  {step.key}
                </span>
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`w-2 sm:w-4 h-0.5 mx-0 transition-all duration-500 ${
                  completed ? 'bg-rose' : 'bg-rose-100 dark:bg-rose-dark/20'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
