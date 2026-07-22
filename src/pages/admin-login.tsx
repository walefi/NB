import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { ThemeMode } from '@/types'

interface AdminLoginPageProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

const TEMP_CREDENTIALS = {
  username: 'admin',
  password: 'nb123456',
}

export function AdminLoginPage({ theme, onToggleTheme }: AdminLoginPageProps) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (username === TEMP_CREDENTIALS.username && password === TEMP_CREDENTIALS.password) {
        localStorage.setItem('nb_admin_auth', 'true')
        navigate('/admin/dashboard')
      } else {
        setError('Credenciais invalidas.')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-rose dark:text-rose-light hover:text-rose-dark dark:hover:text-rose-light/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-6 sm:p-8 bg-white dark:bg-black">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose dark:text-rose-light" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-semibold text-black dark:text-white">
                  Acesso Administrativo
                </h1>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Entre com suas credenciais
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Usuario"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-rose/60 dark:text-rose-light/60 hover:text-rose dark:hover:text-rose-light transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-pink-dark text-center">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Entrar
              </Button>
            </form>

            <div className="mt-6 p-3 bg-rose-50 dark:bg-rose-dark/20 rounded-lg">
              <p className="text-xs text-rose dark:text-rose-light text-center">
                Credenciais temporarias: admin / nb123456
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}