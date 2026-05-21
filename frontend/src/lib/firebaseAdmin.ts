import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore | null = null;

function initAdmin() {
  if (getApps().length > 0) return;
  const saKeyJson = Buffer.from(process.env.GCS_SA_KEY_B64!, 'base64').toString('utf-8');
  const sa = JSON.parse(saKeyJson);
  initializeApp({ credential: cert(sa) });
}

export function getDb(): Firestore {
  if (!db) {
    initAdmin();
    db = getFirestore();
  }
  return db;
}
