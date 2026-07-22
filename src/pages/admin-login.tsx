import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import type { ThemeMode } from '@/types'

interface AdminLoginPageProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminLoginPage({ theme, onToggleTheme }: AdminLoginPageProps) {
  const navigate = useNavigate()
  const { login, resetPassword, currentUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  if (currentUser) {
    navigate('/admin/dashboard', { replace: true })
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await resetPassword(email)
      setSuccess('Email de redefinicao enviado. Verifique sua caixa de entrada.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email.')
    } finally {
      setLoading(false)
    }
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
                  {resetMode ? 'Redefinir Senha' : 'Acesso Administrativo'}
                </h1>
                <p className="text-xs text-black/50 dark:text-white/50">
                  {resetMode ? 'Informe seu email' : 'Entre com suas credenciais'}
                </p>
              </div>
            </div>

            <form onSubmit={resetMode ? handleResetPassword : handleLogin} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
                  <Mail className="w-4 h-4 text-rose" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              {!resetMode && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
                    <Lock className="w-4 h-4 text-rose" />
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
                      placeholder="Sua senha"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rose/60 dark:text-rose-light/60 hover:text-rose dark:hover:text-rose-light transition-colors"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
              )}

              {success && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center">{success}</p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                {resetMode ? 'Enviar Email' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              {resetMode ? (
                <button
                  onClick={() => { setResetMode(false); setError(''); setSuccess('') }}
                  className="text-sm text-rose dark:text-rose-light hover:underline"
                >
                  Voltar ao login
                </button>
              ) : (
                <button
                  onClick={() => { setResetMode(true); setError(''); setSuccess('') }}
                  className="text-sm text-rose dark:text-rose-light hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
