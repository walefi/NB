import { Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Service } from '@/types'

interface ServiceSelectorProps {
  services: Service[]
  loading: boolean
  error: string | null
  selectedId: string | null
  onSelect: (id: string) => void
  onNext: () => void
}

export function ServiceSelector({
  services,
  loading,
  error,
  selectedId,
  onSelect,
  onNext,
}: ServiceSelectorProps) {
  const formatPrice = (price: number) =>
    `R$ ${price.toFixed(2).replace('.', ',')}`

  const formatDuration = (min: number) => {
    if (min < 60) return `${min}min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h${m}min` : `${h}h`
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-light/50 dark:bg-pink-dark/20 mb-4">
          <AlertCircle className="w-7 h-7 text-pink-dark dark:text-pink" />
        </div>
        <p className="text-sm text-pink-dark dark:text-pink mb-2 font-medium">
          Erro ao carregar servicos
        </p>
        <p className="text-xs text-black/40 dark:text-white/40">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-6 animate-pulse"
          >
            <div className="h-5 bg-rose-100 dark:bg-rose-dark/20 rounded w-3/4 mb-3" />
            <div className="h-4 bg-rose-50 dark:bg-rose-dark/10 rounded w-full mb-2" />
            <div className="h-4 bg-rose-50 dark:bg-rose-dark/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-dark/20 mb-4">
          <Clock className="w-7 h-7 text-rose/40 dark:text-rose-light/40" />
        </div>
        <p className="text-sm text-black/40 dark:text-white/40">
          Nenhum servico disponivel no momento.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, i) => (
          <Card
            key={service.id}
            selected={selectedId === service.id}
            onClick={() => onSelect(service.id)}
            className={`animate-fade-in stagger-${i + 1}`}
          >
            <div className="flex flex-col h-full justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-black dark:text-white">
                  {service.name}
                </h3>
                <p className="text-sm text-rose dark:text-rose-light/70 mt-1 leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-rose-100 dark:border-rose-dark/20">
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-rose dark:text-rose-light">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(service.duration)}
                  </span>
                  <span className="font-semibold text-black dark:text-white">
                    {formatPrice(service.price)}
                  </span>
                </div>
                {selectedId === service.id && (
                  <span className="text-xs font-medium text-rose dark:text-rose-light bg-rose-50 dark:bg-rose-dark/20 px-3 py-1 rounded-full">
                    Selecionado
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={!selectedId}>
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
