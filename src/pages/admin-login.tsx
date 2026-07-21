import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { auth, firebaseReady, initError } from '@/lib/firebase/config'
import type { ThemeMode } from '@/types'

interface AdminLoginProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminLogin({ theme, onToggleTheme }: AdminLoginProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!firebaseReady || !auth) {
      setTimeout(() => {
        localStorage.setItem('nb_admin_auth', 'true')
        navigate('/admin/dashboard')
      }, 500)
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      localStorage.setItem('nb_admin_auth', 'true')
      navigate('/admin/dashboard')
    } catch {
      setError('Email ou senha inválidos.')
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
                  Acesso Administrativo
                </h1>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Área restrita
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
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
          </div>

          {!firebaseReady && (
            <p className="text-xs text-center text-rose dark:text-rose-light/50 mt-4">
              {initError
                ? `Firebase: ${initError}.`
                : 'Firebase nao configurado — modo demonstracao.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
