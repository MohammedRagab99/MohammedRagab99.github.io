'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [router, user]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-900/20 dark:via-background dark:to-secondary-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary-600 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">AttendanceApp</CardTitle>
          <CardDescription>نظام الحضور والانصراف والإجازات</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  autoComplete="username"
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="email@company.com"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  autoComplete="current-password"
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
