'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useAppStore();
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
