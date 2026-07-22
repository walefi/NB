import { memo, useState } from 'react'
import { Save, Store, User, Phone, MessageCircle, AtSign, Mail, MapPin, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

export const StudioInfoForm = memo(function StudioInfoForm({ settings, onSave, saving }: Props) {
  const [form, setForm] = useState({
    studioName: settings.studioName,
    ownerName: settings.ownerName,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    instagram: settings.instagram,
    email: settings.email,
    address: settings.address,
    city: settings.city,
    state: settings.state,
    zipCode: settings.zipCode,
    pixKey: settings.pixKey,
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <Store className="w-4 h-4 text-rose" />
            Nome do Estudio
          </label>
          <input
            type="text"
            value={form.studioName}
            onChange={(e) => update('studioName', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="NB Nail Studio"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <User className="w-4 h-4 text-rose" />
            Proprietaria
          </label>
          <input
            type="text"
            value={form.ownerName}
            onChange={(e) => update('ownerName', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="Nome da proprietaria"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <Phone className="w-4 h-4 text-rose" />
            Telefone
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <MessageCircle className="w-4 h-4 text-rose" />
            WhatsApp
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="5511999999999"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <AtSign className="w-4 h-4 text-rose" />
            Instagram
          </label>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => update('instagram', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="@nailstudio"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
            <Mail className="w-4 h-4 text-rose" />
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="contato@nailstudio.com"
          />
        </div>
      </div>

      <div className="border-t border-rose-100 dark:border-rose-dark/20 pt-4">
        <h4 className="text-sm font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose" />
          Endereco
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="Rua, numero, bairro"
            />
          </div>
          <div>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="Cidade"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="UF"
            />
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => update('zipCode', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              placeholder="CEP"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-rose-100 dark:border-rose-dark/20 pt-4">
        <h4 className="text-sm font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-rose" />
          Chave PIX
        </h4>
        <input
          type="text"
          value={form.pixKey}
          onChange={(e) => update('pixKey', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
          placeholder="Chave PIX para pagamentos"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Informacoes'}
        </Button>
      </div>
    </form>
  )
})
