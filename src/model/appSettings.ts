import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export type UILayout = 'navbar' | 'sidebar';

export interface AppSettings {
  user_id: string;
  layout: UILayout;
}

const COLLECTION = 'app_settings';

export async function getAppSettings(user_id: string): Promise<AppSettings | null> {
  const db = getFirestore();
  const ref = doc(db, COLLECTION, user_id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as AppSettings;
}

export async function setAppSettings(settings: AppSettings): Promise<void> {
  const db = getFirestore();
  const ref = doc(db, COLLECTION, settings.user_id);
  await setDoc(ref, settings, { merge: true });
} 