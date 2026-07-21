import type { Service } from '@/types'

export const DEMO_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Alongamento em Gel',
    description: 'Unhas alongadas com gel de alta qualidade, modelagem personalizada para cada formato de mao.',
    price: 120,
    duration: 120,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Banho de Gel',
    description: 'Fortalecimento das unhas naturais com banho de gel, acabamento impecavel e durabilidade.',
    price: 80,
    duration: 90,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Manutencao de Gel',
    description: 'Manutencao completa do alongamento ou banho de gel com reposicao e acabamento.',
    price: 70,
    duration: 90,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Esmaltacao em Gel',
    description: 'Esmaltacao em gel com cores exclusivas, acabamento brilhante e longa duracao.',
    price: 50,
    duration: 60,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Remocao de Gel',
    description: 'Remocao segura de alongamento ou esmaltacao em gel, preservando a saude das unhas naturais.',
    price: 30,
    duration: 40,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
]

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'card', label: 'Cartao' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'to_combine', label: 'A combinar' },
] as const

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluido',
  no_show: 'Nao compareceu',
}

export const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
]

export const MOCK_UNAVAILABLE_TIMES = [
  '09:30',
  '10:00',
  '11:00',
  '14:30',
  '15:00',
  '16:30',
]

export const BUSINESS_HOURS = {
  start: 8,
  end: 19,
}

export const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  card: 'Cartao',
  cash: 'Dinheiro',
  to_combine: 'A combinar',
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}min` : `${h}h`
}

export function formatPrice(price: number): string {
  return `R$ ${price.toFixed(2).replace('.', ',')}`
}
