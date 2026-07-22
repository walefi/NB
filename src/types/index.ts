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

export type NotificationType =
  | 'new_appointment'
  | 'confirmed'
  | 'cancelled'
  | 'rescheduled'
  | 'completed'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'reminder_30min'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  appointmentId: string
  clientName: string
  clientPhone: string
  date: string
  time: string
  createdAt: string
  read: boolean
}

export interface DaySchedule {
  open: boolean
  startTime: string
  endTime: string
}

export interface BreakInterval {
  id: string
  startTime: string
  endTime: string
  label: string
}

export interface DateBlock {
  id: string
  date: string
  reason: string
  type: 'vacation' | 'course' | 'holiday' | 'external' | 'day_off' | 'other'
}

export interface TimeBlock {
  id: string
  date: string
  time: string
  reason: string
}

export interface PaymentMethodConfig {
  id: string
  enabled: boolean
  label: string
}

export interface BusinessPolicies {
  minAdvanceHours: number
  maxAdvanceDays: number
  cancelBeforeHours: number
  rescheduleAllowed: boolean
  confirmationMessage: string
  cancellationMessage: string
}

export interface BusinessPreferences {
  theme: ThemeMode
  language: string
  currency: string
  dateFormat: string
  timeFormat: string
}

export interface BusinessSettings {
  id: string
  studioName: string
  ownerName: string
  phone: string
  whatsapp: string
  instagram: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  pixKey: string
  logo: string
  coverImage: string
  timezone: string
  currency: string
  language: string
  businessHours: Record<string, DaySchedule>
  breaks: BreakInterval[]
  dateBlocks: DateBlock[]
  timeBlocks: TimeBlock[]
  paymentMethods: PaymentMethodConfig[]
  policies: BusinessPolicies
  preferences: BusinessPreferences
  createdAt: string
  updatedAt: string
}
