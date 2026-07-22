import { useState, lazy, Suspense, useCallback } from 'react'
import { Settings, Store, Clock, CalendarX, List, CreditCard, Shield, Palette } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { useBusinessSettings } from '@/hooks/admin/useBusinessSettings'
import type { ThemeMode } from '@/types'

const StudioInfoForm = lazy(() =>
  import('@/components/admin/settings/StudioInfoForm').then((m) => ({ default: m.StudioInfoForm }))
)
const BusinessHoursEditor = lazy(() =>
  import('@/components/admin/settings/BusinessHoursEditor').then((m) => ({ default: m.BusinessHoursEditor }))
)
const BreaksEditor = lazy(() =>
  import('@/components/admin/settings/BreaksEditor').then((m) => ({ default: m.BreaksEditor }))
)
const DateBlocksEditor = lazy(() =>
  import('@/components/admin/settings/DateBlocksEditor').then((m) => ({ default: m.DateBlocksEditor }))
)
const TimeBlocksEditor = lazy(() =>
  import('@/components/admin/settings/TimeBlocksEditor').then((m) => ({ default: m.TimeBlocksEditor }))
)
const ServicesCrud = lazy(() =>
  import('@/components/admin/settings/ServicesCrud').then((m) => ({ default: m.ServicesCrud }))
)
const PaymentMethodsConfig = lazy(() =>
  import('@/components/admin/settings/PaymentMethodsConfig').then((m) => ({ default: m.PaymentMethodsConfig }))
)
const PoliciesEditor = lazy(() =>
  import('@/components/admin/settings/PoliciesEditor').then((m) => ({ default: m.PoliciesEditor }))
)
const PreferencesEditor = lazy(() =>
  import('@/components/admin/settings/PreferencesEditor').then((m) => ({ default: m.PreferencesEditor }))
)

interface AdminSettingsProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

const TABS = [
  { id: 'info', label: 'Dados do Estudio', icon: Store },
  { id: 'hours', label: 'Horarios', icon: Clock },
  { id: 'breaks', label: 'Intervalos', icon: Clock },
  { id: 'dateBlocks', label: 'Bloqueios de Data', icon: CalendarX },
  { id: 'timeBlocks', label: 'Bloqueios de Hora', icon: Clock },
  { id: 'services', label: 'Servicos', icon: List },
  { id: 'payments', label: 'Pagamentos', icon: CreditCard },
  { id: 'policies', label: 'Politicas', icon: Shield },
  { id: 'preferences', label: 'Preferencias', icon: Palette },
] as const

export function AdminSettings({ theme, onToggleTheme }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState<string>('info')
  const { settings, loading, saving, save } = useBusinessSettings()
  const navigate = useNavigate()

  const handleLogout = useCallback(() => {
    localStorage.removeItem('nb_admin_auth')
    navigate('/admin')
  }, [navigate])

  const renderContent = () => {
    if (!settings) return <p className="text-gray-400 text-center py-8">Nenhuma configuracao encontrada.</p>
    switch (activeTab) {
      case 'info':
        return <StudioInfoForm settings={settings} onSave={save} saving={saving} />
      case 'hours':
        return <BusinessHoursEditor settings={settings} onSave={save} saving={saving} />
      case 'breaks':
        return <BreaksEditor settings={settings} onSave={save} saving={saving} />
      case 'dateBlocks':
        return <DateBlocksEditor settings={settings} onSave={save} saving={saving} />
      case 'timeBlocks':
        return <TimeBlocksEditor settings={settings} onSave={save} saving={saving} />
      case 'services':
        return <ServicesCrud />
      case 'payments':
        return <PaymentMethodsConfig settings={settings} onSave={save} saving={saving} />
      case 'policies':
        return <PoliciesEditor settings={settings} onSave={save} saving={saving} />
      case 'preferences':
        return <PreferencesEditor settings={settings} onSave={save} saving={saving} />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-cream dark:bg-black">
      <AdminSidebar theme={theme} onToggleTheme={onToggleTheme} />
      <div className="flex-1 lg:ml-64">
        <AdminHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />
        <main className="p-4 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-rose" />
            <h1 className="text-2xl font-bold text-black dark:text-white">Configuracoes do Estudio</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <nav className="lg:w-56 shrink-0">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-rose text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-dark/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            <div className="flex-1 min-w-0">
              <div className="p-6 rounded-2xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-950">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
                      </div>
                    }
                  >
                    {renderContent()}
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
