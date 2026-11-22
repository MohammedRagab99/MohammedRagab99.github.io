'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarCheck2,
  Calendar,
  Clock,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';

const navigation = [
  { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
  { name: 'الحضور', href: '/attendance', icon: CalendarCheck2 },
  { name: 'الإجازات', href: '/leaves', icon: Calendar },
  { name: 'الأوفر تايم', href: '/overtime', icon: Clock },
  { name: 'التقارير', href: '/reports', icon: FileText },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user } = useAppStore();
  const { logout } = useAuth();

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={cn(
          'fixed top-4 left-4 z-50 h-10 w-10 rounded-lg bg-background border shadow-lg',
          sidebarOpen ? 'left-64' : 'left-4'
        )}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-center border-b px-4">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <CalendarCheck2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">Attendance</span>
            </Link>
          )}
          {!sidebarOpen && (
            <Link href="/dashboard" className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <CalendarCheck2 className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-2" aria-label="Main">
          <ul className="space-y-1" role="list">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    title={sidebarOpen ? undefined : item.name}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator className="mx-2 my-4" />

        <div className="p-2">
          {sidebarOpen ? (
            <div className="space-y-2">
              {user && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span>الإعدادات</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/settings"
                className="flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title="الإعدادات"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
