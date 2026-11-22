import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ATTENDANCE: 'attendance',
  LEAVES: 'leaves',
  OVERTIME: 'overtime',
  HOLIDAYS: 'holidays',
  SETTINGS: 'settings',
  LEAVE_BALANCES: 'leaveBalances',
} as const;

// Helper to get user-specific collection path
export const getUserCollection = (userId: string, collection: string) => {
  return `users/${userId}/${collection}`;
};

export const getUserDoc = (userId: string, collection: string, docId: string) => {
  return `users/${userId}/${collection}/${docId}`;
};