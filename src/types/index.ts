export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  imageURL?: string
  isActive: boolean
  order?: number
  createdAt: string
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export type PaymentMethod = 'pix' | 'card' | 'cash' | 'to_combine'

export interface Appointment {
  id: string
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  clientName: string
  clientPhone: string
  date: string
  time: string
  paymentMethod: PaymentMethod
  notes?: string
  status: AppointmentStatus
  createdAt: string
}

export interface BookingFormData {
  serviceId: string
  date: string
  time: string
  clientName: string
  clientPhone: string
  paymentMethod: PaymentMethod
  notes: string
}

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type ThemeMode = 'light' | 'dark'

export interface ConfirmedData {
  bookingId: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  date: string
  time: string
  clientName: string
  clientPhone: string
  paymentMethod: PaymentMethod
}
