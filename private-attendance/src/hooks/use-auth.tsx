'use client';

import * as React from 'react';
import { User, browserSessionPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserSettings, createUserSettings, initializeHolidays, initializeLeaveBalances } from '@/lib/firestore';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { setUser: setStoreUser, setSettings, logout: storeLogout, setIsLoading } = useAppStore();

  React.useEffect(() => {
    let revision = 0;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const currentRevision = ++revision;
      setUser(null);
      storeLogout();
      setLoading(!!firebaseUser);
      if (!firebaseUser) return;

      try {
        let settings = await getUserSettings(firebaseUser.uid);
        if (!settings) {
          settings = await createUserSettings(firebaseUser.uid, {
            employeeName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          });
          // Initialize holidays and leave balances for current year
          const currentYear = new Date().getFullYear();
          await initializeHolidays(firebaseUser.uid, currentYear);
          await initializeLeaveBalances(firebaseUser.uid, currentYear, settings);
        }
        if (currentRevision !== revision) return;
        setSettings(settings);
        setStoreUser({ uid: firebaseUser.uid, email: firebaseUser.email ?? '', displayName: firebaseUser.displayName ?? undefined });
        setUser(firebaseUser);
      } catch {
        if (currentRevision !== revision) return;
        toast.error('تعذر فتح بيانات الحضور. تحقق من صلاحيات الحساب والاتصال.');
        await signOut(auth).catch(() => {});
      } finally {
        if (currentRevision === revision) setLoading(false);
      }
    });

    return () => {
      revision++;
      unsubscribe();
    };
  }, [setStoreUser, setSettings, storeLogout]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('مرحباً بك!');
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found'
        ? 'البريد الإلكتروني غير مسجل'
        : error.code === 'auth/wrong-password'
        ? 'كلمة المرور غير صحيحة'
        : error.code === 'auth/invalid-email'
        ? 'صيغة البريد الإلكتروني غير صحيحة'
        : 'فشل في تسجيل الدخول';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      toast.success('تم تسجيل الخروج');
    } catch (error) {
      toast.error('فشل في تسجيل الخروج');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
