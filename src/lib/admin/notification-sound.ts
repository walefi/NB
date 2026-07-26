const NOTIFICATION_SOUND_KEY = 'nb_notif_sound_played'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    try {
      audioContext = new AudioContext()
    } catch {
      return null
    }
  }
  return audioContext
}

function createBeep(frequency: number, startTime: number, duration: number, gain: GainNode, ctx: AudioContext): void {
  const oscillator = ctx.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  oscillator.connect(gain)
  gain.gain.setValueAtTime(0.3, startTime)
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export function playNotificationSound(): void {
  if (typeof window === 'undefined') return

  if (sessionStorage.getItem(NOTIFICATION_SOUND_KEY)) return
  sessionStorage.setItem(NOTIFICATION_SOUND_KEY, 'true')

  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      playChime(ctx)
    }).catch(() => {})
  } else {
    playChime(ctx)
  }
}

function playChime(ctx: AudioContext): void {
  const now = ctx.currentTime
  const gain = ctx.createGain()
  gain.connect(ctx.destination)

  createBeep(880, now, 0.15, gain, ctx)
  createBeep(1100, now + 0.12, 0.15, gain, ctx)
  createBeep(1320, now + 0.24, 0.2, gain, ctx)
}

export function resetNotificationSoundFlag(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(NOTIFICATION_SOUND_KEY)
  }
}
