import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, firebaseReady } from '@/lib/firebase/config'

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function getFirebaseErrorMessage(error: { code?: string }): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Usuario nao encontrado.'
    case 'auth/wrong-password':
      return 'Senha incorreta.'
    case 'auth/invalid-email':
      return 'Email invalido.'
    case 'auth/invalid-credential':
      return 'Email ou senha incorretos.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.'
    case 'auth/network-request-failed':
      return 'Erro de conexao. Verifique sua internet.'
    case 'auth/user-disabled':
      return 'Esta conta foi desabilitada.'
    case 'auth/reset-password-failed':
      return 'Erro ao enviar email de redefinicao. Tente novamente.'
    default:
      return 'Erro ao fazer login. Tente novamente.'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    }, () => {
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!firebaseReady || !auth) {
      throw new Error('Firebase nao configurado. Verifique as variaveis de ambiente.')
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const error = err as { code?: string }
      throw new Error(getFirebaseErrorMessage(error))
    }
  }, [])

  const logout = useCallback(async () => {
    if (!firebaseReady || !auth) return
    await signOut(auth)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    if (!firebaseReady || !auth) {
      throw new Error('Firebase nao configurado.')
    }
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      const error = err as { code?: string }
      throw new Error(getFirebaseErrorMessage(error))
    }
  }, [])

  const value: AuthContextValue = {
    currentUser,
    loading,
    login,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
