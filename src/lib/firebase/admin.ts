import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

// Check if we have the required credentials
const hasCredentials = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

let app: App | undefined;

// Initialize Firebase Admin only if we have credentials
if (hasCredentials && getApps().length === 0) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  try {
    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
}

// Export services - they will throw if used without credentials
export const adminAuth: Auth = app ? getAuth(app) : (undefined as unknown as Auth);
export const adminDb: Firestore = app ? getFirestore(app) : (undefined as unknown as Firestore);
export const adminStorage: Storage = app ? getStorage(app) : (undefined as unknown as Storage);

// Helper to check if Firebase Admin is available
export function isFirebaseAdminAvailable(): boolean {
  return !!app;
}
