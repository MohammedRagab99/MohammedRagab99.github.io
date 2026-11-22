'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  Plus,
  FileText,
  Settings,
} from 'lucide-react';
import { cn, formatDate, formatTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getAttendanceRecord, checkIn, checkOut } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const {
    settings,
    setSettings,
    dashboard,
    setDashboard,
    attendanceRecords,
    setAttendanceRecords,
    isLoading,
    setIsLoading,
    addNotification,
  } = useAppStore();
  const router = useRouter();
  const [todayRecord, setTodayRecord] = React.useState<typeof attendanceRecords[0] | null>(null);
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  useEffect(() => {
    if (loading || !user) return;
    loadTodayRecord();
  }, [user, loading]);

  const loadTodayRecord = async () => {
    if (!user || !settings) return;
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const record = await getAttendanceRecord(user.uid, today);
      setTodayRecord(record);
      // Update dashboard state
      setDashboard({
        todayRecord: record,
        settings,
        todayLeaves: [],
        monthOvertime: [],
      });
    } catch (error) {
      console.error('Failed to load today record:', error);
      toast.error('فشل في تحميل سجل اليوم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user || !settings) return;
    setIsCheckingIn(true);
    try {
      const now = new Date().toISOString();
      const record = await checkIn(user.uid, new Date().toISOString().split('T')[0], now, undefined, settings);
      setTodayRecord(record);
      addNotification({ message: 'تم تسجيل الحضور بنجاح', type: 'success' });
      toast.success('تم تسجيل الحضور');
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error('فشل في تسجيل الحضور');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !settings || !todayRecord) return;
    setIsCheckingOut(true);
    try {
      const now = new Date().toISOString();
      const record = await checkOut(user.uid, new Date().toISOString().split('T')[0], now, undefined, settings);
      setTodayRecord(record);
      addNotification({ message: 'تم تسجيل الانصراف بنجاح', type: 'success' });
      toast.success('تم تسجيل الانصراف');
    } catch (error) {
      console.error('Check-out failed:', error);
      toast.error('فشل في تسجيل الانصراف');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const canCheckIn = !todayRecord?.checkInTime;
  const canCheckOut = todayRecord?.checkInTime && !todayRecord?.checkOutTime;
  const isOnLeave = todayRecord?.status === 'on_leave';
  const isHoliday = todayRecord?.status === 'holiday';
  const isWeekend = todayRecord?.status === 'weekend';

  const getStatusConfig = () => {
    if (isOnLeave) return { label: 'في إجازة', color: 'info', icon: Calendar };
    if (isHoliday) return { label: 'عطلة رسمية', color: 'warning', icon: AlertCircle };
    if (isWeekend) return { label: 'عطلة أسبوعية', color: 'secondary', icon: Calendar };
    if (todayRecord?.checkOutTime) return { label: 'تم الانصراف', color: 'success', icon: CheckCircle };
    if (todayRecord?.checkInTime) return { label: 'تم الحضور', color: 'info', icon: Clock };
    return { label: 'لم يتم التسجيل', color: 'destructive', icon: XCircle };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">
              مرحباً، {settings?.employeeName || 'موظف'} — {formatDate(new Date())}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/attendance')}>
              <Calendar className="h-4 w-4 mr-1" />
              سجل الحضور
            </Button>
          </div>
        </div>

        {/* Main Action Card */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-16 w-16 rounded-full flex items-center justify-center',
                    canCheckIn ? 'bg-green-100 dark:bg-green-900/30' :
                    canCheckOut ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <StatusIcon className={cn('h-8 w-8', canCheckIn ? 'text-green-600' : canCheckOut ? 'text-blue-600' : 'text-gray-500')} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{statusConfig.label}</p>
                  <p className="text-muted-foreground">
                    {todayRecord?.checkInTime && `الحضور: ${formatTime(todayRecord.checkInTime)}`}
                    {todayRecord?.checkOutTime && ` • الانصراف: ${formatTime(todayRecord.checkOutTime)}`}
                    {todayRecord?.totalWorkHours && ` • ساعات العمل: ${todayRecord.totalWorkHours.toFixed(2)}`}
                    {todayRecord?.overtimeHours && ` • أوفر تايم: ${todayRecord.overtimeHours.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {canCheckIn && !isOnLeave && !isHoliday && !isWeekend && (
                  <Button
                    size="lg"
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {isCheckingIn ? 'جاري التسجيل...' : 'تسجيل الحضور'}
                  </Button>
                )}

                {canCheckOut && (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleCheckOut}
                    disabled={isCheckingOut}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    {isCheckingOut ? 'جاري التسجيل...' : 'تسجيل الانصراف'}
                  </Button>
                )}

                {(isOnLeave || isHoliday || isWeekend) && (
                  <Badge variant={statusConfig.color as any} className="text-lg px-4 py-2">
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="أيام الحضور"
            value={attendanceRecords.filter(r => r.status === 'present').length}
            icon={CheckCircle}
            color="text-green-600 bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            title="أيام الغياب"
            value={attendanceRecords.filter(r => r.status === 'absent').length}
            icon={XCircle}
            color="text-red-600 bg-red-100 dark:bg-red-900/30"
          />
          <StatCard
            title="أيام التأخير"
            value={attendanceRecords.filter(r => r.status === 'late').length}
            icon={Clock}
            color="text-orange-600 bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            title="ساعات العمل"
            value={attendanceRecords.reduce((sum, r) => sum + r.totalWorkHours, 0).toFixed(1)}
            icon={TrendingUp}
            color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
          />
        </div>

        {/* Today's Leave Info */}
        {dashboard?.todayLeaves && dashboard.todayLeaves.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                إجازة اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.todayLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">إجازة {leave.leaveType}</p>
                      <p className="text-sm text-muted-foreground">{leave.totalDays} أيام</p>
                    </div>
                  </div>
                  <Badge variant={leave.status === 'approved' ? 'success' : 'warning'}>
                    {leave.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Monthly Overtime Summary */}
        {dashboard?.monthOvertime && dashboard.monthOvertime.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                ملخص الأوفر تايم لهذا الشهر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">إجمالي الساعات</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboard.monthOvertime.reduce((sum, r) => sum + r.totalHours, 0).toFixed(1)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">طلبات معتمدة</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboard.monthOvertime.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <QuickActionButton
                icon={Plus}
                title="طلب إجازة"
                description="إضافة طلب إجازة جديد"
                onClick={() => router.push('/leaves')}
              />
              <QuickActionButton
                icon={Clock}
                title="طلب أوفر تايم"
                description="إضافة ساعات عمل إضافية"
                onClick={() => router.push('/overtime')}
              />
              <QuickActionButton
                icon={FileText}
                title="إنشاء تقرير"
                description="تصدير تقرير PDF"
                onClick={() => router.push('/reports')}
              />
              <QuickActionButton
                icon={Calendar}
                title="عرض الحضور"
                description="مراجعة سجلات الشهر"
                onClick={() => router.push('/attendance')}
              />
              <QuickActionButton
                icon={AlertCircle}
                title="إضافة عطلة"
                description="إضافة عطلة رسمية/خاصة"
                onClick={() => router.push('/settings?tab=holidays')}
              />
              <QuickActionButton
                icon={Settings}
                title="الإعدادات"
                description="تخصيص التطبيق"
                onClick={() => router.push('/settings')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-accent transition-colors text-center"
    >
      <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}