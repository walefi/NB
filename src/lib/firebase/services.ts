import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  type DocumentData,
  type FirestoreError,
} from 'firebase/firestore'
import { db, firebaseReady } from './config'
import { DEMO_SERVICES } from '@/constants'
import type { Service } from '@/types'

export class ServicesError extends Error {
  public readonly code: string
  public readonly original?: FirestoreError

  constructor(message: string, code: string, original?: FirestoreError) {
    super(message)
    this.name = 'ServicesError'
    this.code = code
    this.original = original
  }
}

function mapServiceDoc(doc: DocumentData, id: string): Service {
  const data = doc.data?.() ?? doc
  return {
    id,
    name: data.name ?? '',
    description: data.description ?? '',
    price: typeof data.price === 'number' ? data.price : 0,
    duration: typeof data.duration === 'number' ? data.duration : 60,
    imageURL: data.imageURL ?? undefined,
    isActive: data.isActive ?? true,
    order: typeof data.order === 'number' ? data.order : undefined,
    createdAt: data.createdAt ?? new Date().toISOString(),
  }
}

export async function fetchServices(): Promise<Service[]> {
  if (!firebaseReady || !db) return DEMO_SERVICES.filter((s) => s.isActive)

  try {
    const q = query(
      collection(db, 'services'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    )
    const snapshot = await getDocs(q)
    const services = snapshot.docs.map((d) => mapServiceDoc(d, d.id))

    if (services.length === 0) {
      return DEMO_SERVICES.filter((s) => s.isActive)
    }

    return services
  } catch (err) {
    const firestoreErr = err as FirestoreError
    if (firestoreErr.code === 'failed-precondition') {
      throw new ServicesError(
        'Indice necessario. Execute o comando de criacao de indice no Firebase.',
        'missing-index',
        firestoreErr
      )
    }
    return DEMO_SERVICES.filter((s) => s.isActive)
  }
}

export async function fetchServiceById(id: string): Promise<Service | null> {
  if (!firebaseReady || !db)
    return DEMO_SERVICES.find((s) => s.id === id) ?? null

  try {
    const snap = await getDoc(doc(db, 'services', id))
    if (!snap.exists()) return null
    return mapServiceDoc(snap, snap.id)
  } catch {
    return DEMO_SERVICES.find((s) => s.id === id) ?? null
  }
}
