'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-900/20 dark:via-background dark:to-secondary-900/20 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="h-16 w-16 rounded-xl bg-primary-600 flex items-center justify-center">
            <CalendarCheck2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center">AttendanceApp</h2>
          <p className="text-center text-muted-foreground">جاري التحميل...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </CardContent>
      </Card>
    </div>
  );
}