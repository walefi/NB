import { Input } from '@/components/ui/Input'

interface ClientFormProps {
  name: string
  phone: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  errors: { name?: string; phone?: string }
}

export function ClientForm({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  errors,
}: ClientFormProps) {
  const handlePhone = (value: string) => {
    let digits = value.replace(/\D/g, '')
    if (digits.length > 11) digits = digits.slice(0, 11)
    let formatted = digits
    if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    }
    if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    }
    onPhoneChange(formatted)
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nome completo"
        placeholder="Seu nome"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        error={errors.name}
        autoComplete="name"
      />
      <Input
        label="WhatsApp"
        placeholder="(11) 99999-9999"
        value={phone}
        onChange={(e) => handlePhone(e.target.value)}
        error={errors.phone}
        inputMode="tel"
        autoComplete="tel"
      />
      <p className="text-xs text-rose/50 dark:text-rose-light/40 text-center pt-2">
        Entraremos em contato para confirmar seu horario.
      </p>
    </div>
  )
}
