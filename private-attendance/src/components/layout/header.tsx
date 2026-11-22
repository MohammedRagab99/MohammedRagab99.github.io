'use client';

import * as React from 'react';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { notifications: appNotifications, removeNotification } = useAppStore();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => useAppStore.getState().toggleSidebar()}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:flex items-center gap-2">
          <span className="font-semibold text-lg text-foreground">AttendanceApp</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifications ${appNotifications.length > 0 ? `(${appNotifications.length})` : ''}`}
          >
            <Bell className={cn('h-5 w-5', appNotifications.length > 0 && 'text-primary-600')} />
            {appNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {appNotifications.length > 9 ? '9+' : appNotifications.length}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-popover border shadow-lg rounded-lg p-2 z-50">
              <div className="flex items-center justify-between px-2 py-2">
                <h3 className="font-semibold">الإشعارات</h3>
                <Button variant="ghost" size="sm" onClick={() => appNotifications.forEach(n => removeNotification(n.id))}>
                  مسح الكل
                </Button>
              </div>
              <Separator />
              {appNotifications.length === 0 ? (
                <p className="px-2 py-4 text-center text-muted-foreground text-sm">لا توجد إشعارات</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {appNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-2 py-2 hover:bg-accent rounded-lg cursor-pointer"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <p className="text-sm">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
