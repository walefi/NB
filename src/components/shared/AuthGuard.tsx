import { useEffect } from 'react'
import { firebaseReady } from '@/lib/firebase/config'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  useEffect(() => {
    const authed = localStorage.getItem('nb_admin_auth')
    if (!authed && !firebaseReady) {
      // In demo mode, redirect to login if not authenticated
    }
  }, [])

  return <>{children}</>
}
