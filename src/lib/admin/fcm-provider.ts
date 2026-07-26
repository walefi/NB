import { isFCMSupported, getFirebaseMessaging } from '@/lib/firebase/messaging'

export function isFCMAvailable(): boolean {
  return isFCMSupported() && getFirebaseMessaging() !== null
}

export function getPermissionStatus(): NotificationPermission {
  if (!isFCMSupported()) return 'denied'
  return Notification.permission
}

export async function sendLocalTestNotification(): Promise<boolean> {
  if (!isFCMSupported()) return false

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  try {
    new Notification('💅 NB Nail - Teste', {
      body: 'Notificacoes push estao funcionando!',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    })
    return true
  } catch {
    return false
  }
}

export function getFCMStatusText(permission: NotificationPermission): string {
  switch (permission) {
    case 'granted': return 'Notificacoes ativas'
    case 'denied': return 'Notificacoes bloqueadas'
    case 'default': return 'Notificacoes nao configuradas'
    default: return 'Status desconhecido'
  }
}
