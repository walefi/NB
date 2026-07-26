// src/services/notification-service.ts
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase/config';

/**
 * Registers an admin device token for push notifications.
 * Stores token and metadata in the `adminTokens` collection.
 */
export async function registerAdminToken(
  token: string,
  options: { uid: string; device: string; browser: string }
) {
  const db = getFirestore(firebaseApp);
  const tokenRef = doc(collection(db, 'adminTokens'));
  await setDoc(tokenRef, {
    uid: options.uid,
    token,
    device: options.device,
    browser: options.browser,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
