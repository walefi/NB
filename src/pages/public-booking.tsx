import { useState, useCallback } from 'react'
import { Sparkles, ArrowDown, Scissors } from 'lucide-react'
import { Header } from '@/components/shared/Header'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BookingStepper } from '@/components/booking/BookingStepper'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { DatePicker } from '@/components/booking/DatePicker'
import { TimePicker } from '@/components/booking/TimePicker'
import { ClientForm } from '@/components/booking/ClientForm'
import { PaymentSelector } from '@/components/booking/PaymentSelector'
import { BookingReview } from '@/components/booking/BookingReview'
import { useServices } from '@/hooks/useServices'
import { useAppointments } from '@/hooks/useAppointments'
import { createAppointment, AppointmentsError } from '@/lib/firebase/appointments'
import { formatBookingDate } from '@/lib/utils'
import { formatDuration, formatPrice, PAYMENT_LABELS } from '@/constants'
import type { BookingStep, PaymentMethod, ConfirmedData } from '@/types'

interface PublicBookingProps {
  theme: import('@/types').ThemeMode
  onToggleTheme: () => void
}

function generateBookingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let id = 'NB-'
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length))
  return id
}

export function PublicBooking({ theme, onToggleTheme }: PublicBookingProps) {
  const { services, loading: servicesLoading, error: servicesError } = useServices()
  const [step, setStep] = useState<BookingStep>(1)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<ConfirmedData | null>(null)

  const service = services.find((s) => s.id === selectedServiceId) ?? null

  const { appointments } = useAppointments(selectedDate || undefined)
  const existingTimes = selectedDate
    ? appointments.filter((a) => a.status !== 'cancelled').map((a) => a.time)
    : []

  const scrollToBooking = () => {
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToStep = useCallback((newStep: BookingStep) => {
    if (newStep < 7) {
      setStep(newStep)
    }
  }, [])

  const nextStep = useCallback(() => {
    if (step === 1 && !selectedServiceId) return
    if (step === 2 && !selectedDate) return
    if (step === 3 && !selectedTime) return
    if (step === 4) {
      const errs: { name?: string; phone?: string } = {}
      if (!clientName.trim()) errs.name = 'Informe seu nome completo.'
      else if (clientName.trim().length < 3) errs.name = 'Nome muito curto.'
      if (!clientPhone.trim()) errs.phone = 'Informe seu WhatsApp.'
      else if (clientPhone.replace(/\D/g, '').length < 10)
        errs.phone = 'Numero de WhatsApp invalido. Use DDD + numero.'
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        return
      }
      setErrors({})
    }
    if (step === 5 && !paymentMethod) return
    if (step < 7) {
      setStep((step + 1) as BookingStep)
      setConfirmError(null)
    }
  }, [step, selectedServiceId, selectedDate, selectedTime, clientName, clientPhone, paymentMethod])

  const prevStep = useCallback(() => {
    if (step > 1 && step < 7) {
      setStep((step - 1) as BookingStep)
      setConfirmError(null)
    }
  }, [step])

  const handleConfirm = async () => {
    if (!service || !selectedDate || !selectedTime || !clientName || !clientPhone || !paymentMethod) return
    setSubmitting(true)

    const bookingId = generateBookingId()

    const confirmedData: ConfirmedData = {
      bookingId,
      serviceName: service.name,
      serviceDuration: service.duration,
      servicePrice: service.price,
      date: selectedDate,
      time: selectedTime,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      paymentMethod: paymentMethod as PaymentMethod,
    }

    try {
      await createAppointment({
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date: selectedDate,
        time: selectedTime,
        paymentMethod: paymentMethod as PaymentMethod,
      })
      setConfirmed(confirmedData)
      setStep(7)
      scrollToTop()
    } catch (err) {
      if (err instanceof AppointmentsError) {
        setConfirmError(err.message)
      } else {
        setConfirmError('Erro ao salvar agendamento. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const resetFlow = () => {
    setStep(1)
    setSelectedServiceId(null)
    setSelectedDate('')
    setSelectedTime('')
    setClientName('')
    setClientPhone('')
    setPaymentMethod('')
    setErrors({})
    setConfirmError(null)
    setConfirmed(null)
    scrollToTop()
  }

  const renderStepContent = () => {
    if (step === 7 && confirmed) {
      return (
        <div className="text-center py-6 animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-dark/20 mb-6">
            <svg className="w-10 h-10 text-rose dark:text-rose-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
            Agendamento realizado!
          </h3>
          <p className="text-black/50 dark:text-white/50 mb-2 text-sm leading-relaxed">
            Seu horario foi solicitado com sucesso.
          </p>
          <p className="text-rose dark:text-rose-light text-sm mb-8">
            Entraremos em contato pelo WhatsApp para confirmar.
          </p>

          <Card className="text-left max-w-sm mx-auto mb-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-dark/20">
                <span className="text-xs text-black/40 dark:text-white/40">Codigo</span>
                <span className="text-sm font-mono font-bold text-rose dark:text-rose-light tracking-wider">
                  {confirmed.bookingId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-black/50 dark:text-white/50">Servico</span>
                <span className="font-medium text-black dark:text-white text-sm">{confirmed.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-black/50 dark:text-white/50">Duracao</span>
                <span className="font-medium text-black dark:text-white text-sm">{formatDuration(confirmed.serviceDuration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-black/50 dark:text-white/50">Data</span>
                <span className="font-medium text-black dark:text-white text-sm">{formatBookingDate(confirmed.date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-black/50 dark:text-white/50">Horario</span>
                <span className="font-medium text-black dark:text-white text-sm">{confirmed.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-black/50 dark:text-white/50">Pagamento</span>
                <span className="font-medium text-black dark:text-white text-sm">
                  {PAYMENT_LABELS[confirmed.paymentMethod]}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-rose-100 dark:border-rose-dark/20">
                <span className="text-xs text-black/50 dark:text-white/50">Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-light dark:bg-pink-dark/20 text-rose dark:text-rose-light">
                  Pendente de confirmacao
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-black/50 dark:text-white/50">Valor</span>
                <span className="text-lg font-bold text-rose dark:text-rose-light">
                  {formatPrice(confirmed.servicePrice)}
                </span>
              </div>
            </div>
          </Card>

          <Button size="lg" onClick={resetFlow}>
            Voltar para o inicio
          </Button>
        </div>
      )
    }

    switch (step) {
      case 1:
        return (
          <ServiceSelector
            services={services}
            loading={servicesLoading}
            error={servicesError}
            selectedId={selectedServiceId}
            onSelect={setSelectedServiceId}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <div>
            <DatePicker selectedDate={selectedDate} onSelect={setSelectedDate} />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>Voltar</Button>
              <Button onClick={nextStep} disabled={!selectedDate}>Continuar</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div>
            <TimePicker
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
              selectedDate={selectedDate}
              existingTimes={existingTimes}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>Voltar</Button>
              <Button onClick={nextStep} disabled={!selectedTime}>Continuar</Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div>
            <ClientForm
              name={clientName}
              phone={clientPhone}
              onNameChange={setClientName}
              onPhoneChange={setClientPhone}
              errors={errors}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>Voltar</Button>
              <Button onClick={nextStep}>Continuar</Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div>
            <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>Voltar</Button>
              <Button onClick={nextStep} disabled={!paymentMethod}>Continuar</Button>
            </div>
          </div>
        )
      case 6:
        return (
          <div>
            <BookingReview
              service={service}
              date={selectedDate}
              time={selectedTime}
              clientName={clientName}
              clientPhone={clientPhone}
              paymentMethod={paymentMethod}
            />
            {confirmError && (
              <div className="mt-4 p-4 rounded-2xl bg-pink-light/50 dark:bg-pink-dark/10 border border-pink-dark/20 dark:border-pink-dark/30 text-sm text-pink-dark dark:text-pink text-center animate-fade-in">
                {confirmError}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep}>Voltar</Button>
              <Button onClick={handleConfirm} loading={submitting} size="lg">
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-white to-pink-50/60 dark:from-rose-dark/10 dark:via-black dark:to-pink-dark/10" />
        <div className="absolute top-32 right-10 w-[500px] h-[500px] bg-rose/[0.04] dark:bg-rose/[0.08] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-pink/[0.04] dark:bg-pink/[0.08] rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 sm:pt-40 sm:pb-28">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-50/80 dark:bg-rose-dark/20 backdrop-blur-sm text-rose dark:text-rose-light text-sm font-medium mb-10 animate-fade-in border border-rose-100/50 dark:border-rose-dark/30">
              <Sparkles className="w-4 h-4" />
              Nail Design
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 animate-slide-up stagger-1 text-balance leading-[1.05]">
              NB Nath
              <br />
              Bittencourt
            </h1>

            <p className="font-serif text-xl sm:text-2xl text-rose dark:text-rose-light italic mb-8 animate-slide-up stagger-2">
              &ldquo;Realce sua beleza atraves de detalhes.&rdquo;
            </p>

            <p className="text-black/50 dark:text-white/50 text-base sm:text-lg max-w-md mx-auto mb-12 animate-slide-up stagger-3 leading-relaxed">
              Agende seu horario com exclusividade. Alongamento, banho de gel, manutencao e esmaltacao com o cuidado que suas unhas merecem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-4">
              <Button size="lg" onClick={scrollToBooking} className="min-w-[220px]">
                Agendar Horario
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="min-w-[220px]"
              >
                Ver Servicos
                <Scissors className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <p className="text-xs sm:text-sm font-medium text-rose dark:text-rose-light uppercase tracking-[0.25em] mb-4">
            Nossos Servicos
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white text-balance">
            Cuidamos de cada detalhe
          </h2>
          <p className="text-black/40 dark:text-white/40 mt-4 max-w-md mx-auto text-sm">
            Escolha o servico ideal e agende em poucos cliques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {servicesLoading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-6 animate-pulse h-48">
                  <div className="h-5 bg-rose-100 dark:bg-rose-dark/20 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-rose-50 dark:bg-rose-dark/10 rounded w-full mb-2" />
                  <div className="h-4 bg-rose-50 dark:bg-rose-dark/10 rounded w-2/3" />
                </div>
              ))
            : services.map((s, i) => (
                <Card key={s.id} className={`animate-fade-in stagger-${i + 1} flex flex-col justify-between group`}>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-black dark:text-white mb-2 group-hover:text-rose dark:group-hover:text-rose-light transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed mb-4">
                      {s.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-rose dark:text-rose-light/70 mb-4">
                      <span className="bg-rose-50 dark:bg-rose-dark/20 px-3 py-1 rounded-full font-medium">
                        {formatDuration(s.duration)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-rose-100 dark:border-rose-dark/20">
                    <span className="text-2xl font-bold text-black dark:text-white">
                      {formatPrice(s.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedServiceId(s.id)
                        setStep(1)
                        scrollToBooking()
                      }}
                    >
                      Agendar
                    </Button>
                  </div>
                </Card>
              ))}
        </div>
      </section>

      {/* Booking Flow */}
      <section
        id="booking-section"
        className="max-w-2xl mx-auto px-4 sm:px-6 py-20 sm:py-28 border-t border-rose-100 dark:border-rose-dark/20"
      >
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-medium text-rose dark:text-rose-light uppercase tracking-[0.25em] mb-4">
            Agendamento
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-black dark:text-white">
            Reserve seu horario
          </h2>
        </div>

        <BookingStepper currentStep={step} onStepClick={goToStep} />

        <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-6 sm:p-8 shadow-sm">
          {renderStepContent()}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-100 dark:border-rose-dark/20 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="font-serif font-bold text-rose dark:text-rose-light text-lg">NB</span>
          </div>
          <p className="text-sm text-rose/50 dark:text-rose-light/40">
            Nath Bittencourt &copy; {new Date().getFullYear()} &mdash; Nail Design
          </p>
        </div>
      </footer>
    </div>
  )
}
