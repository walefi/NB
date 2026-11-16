import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
} from 'firebase/firestore'
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from 'firebase/auth'

const PROJECT_ID = 'nb-nail'
const DATE = '2026-11-20'

const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT_ID, authDomain: 'demo.local' })
const db = getFirestore(app)
const auth = getAuth(app)
connectFirestoreEmulator(db, '127.0.0.1', 8080)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' -> ' + detail : ''}`)
}

function appointmentPayload(time, duration = 60) {
  return {
    serviceId: 'svc1',
    serviceName: 'Manicure',
    servicePrice: 80,
    serviceDuration: duration,
    clientName: 'Joana da Silva',
    clientPhone: '(11) 99999-0000',
    clientEmail: null,
    date: DATE,
    time,
    startTime: time,
    endTime: time,
    paymentMethod: 'pix',
    paymentStatus: 'pending',
    notes: null,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

async function anonymousBooking(time, duration = 60) {
  return runTransaction(db, async (transaction) => {
    const availabilityRef = doc(db, 'availability', DATE)
    const availabilitySnap = await transaction.get(availabilityRef)
    const slots = availabilitySnap.exists() ? availabilitySnap.data()?.slots ?? {} : {}

    const newStart = Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
    const newEnd = newStart + duration
    const conflict = Object.entries(slots).some(([slotTime, slotDuration]) => {
      const s = Number(slotTime.slice(0, 2)) * 60 + Number(slotTime.slice(3))
      const e = s + (slotDuration || 0)
      return newStart < e && newEnd > s
    })
    if (conflict) {
      const err = new Error('SLOT_TAKEN')
      err.code = 'SLOT_TAKEN'
      throw err
    }

    const appointmentRef = doc(collection(db, 'appointments'))
    transaction.set(appointmentRef, appointmentPayload(time, duration))
    transaction.set(availabilityRef, {
      date: DATE,
      slots: { ...slots, [time]: duration },
      updatedAt: new Date().toISOString(),
    })
    return appointmentRef
  })
}

async function main() {
  // ---- anonymous (public booking) ----

  try {
    await getDocs(query(collection(db, 'appointments'), where('date', '==', DATE)))
    check('anonymous read of /appointments is DENIED (no PII leak)', false, 'read was allowed!')
  } catch (e) {
    check('anonymous read of /appointments is DENIED (no PII leak)', true, e.code)
  }

  try {
    await runTransaction(db, async (transaction) => {
      return transaction.get(doc(db, 'appointments', 'any-id'))
    })
    check('anonymous read of an /appointments doc is DENIED', false, 'read was allowed!')
  } catch (e) {
    check('anonymous read of an /appointments doc is DENIED', true, e.code)
  }

  let firstId = null
  try {
    const ref = await anonymousBooking('09:00', 60)
    firstId = ref.id
    check('anonymous booking writes appointment + availability', true, ref.id)
  } catch (e) {
    check('anonymous booking writes appointment + availability', false, `${e.code}: ${e.message}`)
    return
  }

  try {
    const snap = await getDoc(doc(db, 'availability', DATE))
    const slots = snap.data()?.slots ?? {}
    check('availability doc is publicly readable', snap.exists(), JSON.stringify(slots))
    check('availability holds the booked slot', slots['09:00'] === 60, JSON.stringify(slots))
  } catch (e) {
    check('availability doc is publicly readable', false, e.code)
  }

  try {
    await getDoc(doc(db, 'appointments', firstId))
    check('anonymous cannot read the appointment (PII protected)', false, 'read was allowed!')
  } catch (e) {
    check('anonymous cannot read the appointment (PII protected)', true, e.code)
  }

  try {
    await anonymousBooking('09:00', 60)
    check('double booking of the same time is REJECTED', false, 'second booking succeeded!')
  } catch (e) {
    check('double booking of the same time is REJECTED', true, e.code)
  }

  try {
    await anonymousBooking('09:30', 60)
    check('overlapping booking (09:30 vs 09:00) is REJECTED', false, 'overlap was accepted!')
  } catch (e) {
    check('overlapping booking (09:30 vs 09:00) is REJECTED', true, e.code)
  }

  try {
    await anonymousBooking('11:00', 60)
    check('booking a free time succeeds', true)
  } catch (e) {
    check('booking a free time succeeds', false, `${e.code}: ${e.message}`)
  }

  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, 'availability', DATE)
      const snap = await transaction.get(ref)
      const slots = { ...(snap.data()?.slots ?? {}) }
      delete slots['09:00']
      transaction.set(ref, { date: DATE, slots, updatedAt: new Date().toISOString() })
    })
    check('anonymous cannot free a slot', false, 'slot removal was allowed!')
  } catch (e) {
    check('anonymous cannot free a slot', true, e.code)
  }

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(doc(db, 'availability', 'nao-e-uma-data'), {
        date: 'nao-e-uma-data',
        slots: { '09:00': 60 },
        updatedAt: new Date().toISOString(),
      })
    })
    check('anonymous cannot create an availability doc with a malformed date', false, 'creation was allowed!')
  } catch (e) {
    check('anonymous cannot create an availability doc with a malformed date', true, e.code)
  }

  // ---- admin (authenticated) ----

  const adminUser = await createUserWithEmailAndPassword(auth, 'admin@teste.com', 'senha123456')
  await new Promise((r) => setTimeout(r, 800))
  check('admin session is established', adminUser.user.uid.length > 0, adminUser.user.uid)

  try {
    const snap = await getDoc(doc(db, 'appointments', firstId))
    check('appointment exists and is readable by the admin', snap.exists(), snap.data()?.clientName)
  } catch (e) {
    check('appointment exists and is readable by the admin', false, e.code)
  }

  try {
    const snap = await getDocs(query(collection(db, 'appointments'), where('date', '==', DATE)))
    check('admin can read the /appointments collection', snap.docs.length > 0, `${snap.docs.length} docs`)
  } catch (e) {
    check('admin can read the /appointments collection', false, e.code)
  }

  try {
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, 'availability', DATE)
      const snap = await transaction.get(ref)
      const slots = { ...(snap.data()?.slots ?? {}) }
      delete slots['09:00']
      transaction.set(ref, { date: DATE, slots, updatedAt: new Date().toISOString() })
    })
    const snap = await getDoc(doc(db, 'availability', DATE))
    const slots = snap.data()?.slots ?? {}
    check('authenticated admin can free a slot', slots['09:00'] === undefined, JSON.stringify(slots))
  } catch (e) {
    check('authenticated admin can free a slot', false, `${e.code}: ${e.message}`)
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  process.exitCode = failed.length === 0 ? 0 : 1
  setTimeout(() => process.exit(process.exitCode), 200)
}

main().catch((e) => {
  console.error('UNEXPECTED', e)
  process.exit(2)
})
