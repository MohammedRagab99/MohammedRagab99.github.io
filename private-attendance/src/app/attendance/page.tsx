'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, Search } from 'lucide-react';
import { cn, formatDate, formatTime, getStatusColor, getStatusLabel, getMonthName, parseYearMonth, startOfMonth, endOfMonth } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getAttendanceRecords, getAttendanceStats } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';

const MONTHS = [
  { value: 1, label: 'يناير' },
  { value: 2, label: 'فبراير' },
  { value: 3, label: 'مارس' },
  { value: 4, label: 'أبريل' },
  { value: 5, label: 'مايو' },
  { value: 6, label: 'يونيو' },
  { value: 7, label: 'يوليو' },
  { value: 8, label: 'أغسطس' },
  { value: 9, label: 'سبتمبر' },
  { value: 10, label: 'أكتوبر' },
  { value: 11, label: 'نوفمبر' },
  { value: 12, label: 'ديسمبر' },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const { attendanceRecords, setAttendanceRecords, isLoading, setIsLoading, settings, currentDate, setCurrentDate } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const [stats, setStats] = useState<{
    present: number;
    absent: number;
    late: number;
    earlyLeave: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadRecords();
  }, [user, selectedMonth]);

  const loadRecords = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

      const [records, statsData] = await Promise.all([
        getAttendanceRecords(user.uid, startDate, endDate),
        getAttendanceStats(user.uid, startDate, endDate),
      ]);

      setAttendanceRecords(records);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load attendance:', error);
      toast.error('فشل في تحميل سجلات الحضور');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    const date = parseYearMonth(selectedMonth);
    date.setMonth(date.getMonth() - 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
    setCurrentDate(date);
  };

  const goToNextMonth = () => {
    const date = parseYearMonth(selectedMonth);
    date.setMonth(date.getMonth() + 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
    setCurrentDate(date);
  };

  const goToCurrentMonth = () => {
    const date = new Date();
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
    setCurrentDate(date);
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthName = getMonthName(month);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with Month Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">{monthName} {year}</h1>
                  <p className="text-sm text-muted-foreground">سجلات الحضور والانصراف</p>
                </div>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={goToCurrentMonth}>
                  <Calendar className="h-4 w-4 mr-1" />
                  الشهر الحالي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard title="حاضر" value={stats.present} color="text-green-600 bg-green-100 dark:bg-green-900/30" icon={CheckCircle2} />
            <StatCard title="غائب" value={stats.absent} color="text-red-600 bg-red-100 dark:bg-red-900/30" icon={XCircle} />
            <StatCard title="متأخر" value={stats.late} color="text-orange-600 bg-orange-100 dark:bg-orange-900/30" icon={Clock} />
            <StatCard title="انصراف مبكر" value={stats.earlyLeave} color="text-red-600 bg-red-100 dark:bg-red-900/30" icon={LogOut} />
            <StatCard title="ساعات العمل" value={stats.totalWorkHours.toFixed(1)} color="text-blue-600 bg-blue-100 dark:bg-blue-900/30" icon={TrendingUp} />
            <StatCard title="أوفر تايم" value={stats.totalOvertimeHours.toFixed(1)} color="text-purple-600 bg-purple-100 dark:bg-purple-900/30" icon={Clock} />
          </div>
        )}

        {/* Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>سجلات الحضور ({attendanceRecords.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="بحث..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="present">حاضر</SelectItem>
                  <SelectItem value="absent">غائب</SelectItem>
                  <SelectItem value="late">متأخر</SelectItem>
                  <SelectItem value="early_leave">انصراف مبكر</SelectItem>
                  <SelectItem value="on_leave">في إجازة</SelectItem>
                  <SelectItem value="holiday">عطلة</SelectItem>
                  <SelectItem value="weekend">عطلة أسبوعية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد سجلات لهذا الشهر</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>اليوم</TableHead>
                      <TableHead>الحضور</TableHead>
                      <TableHead>الانصراف</TableHead>
                      <TableHead>ساعات العمل</TableHead>
                      <TableHead>أوفر تايم</TableHead>
                      <TableHead>تأخير</TableHead>
                      <TableHead>انصراف مبكر</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{getDayName(record.date)}</TableCell>
                        <TableCell>{record.checkInTime ? formatTime(record.checkInTime) : '—'}</TableCell>
                        <TableCell>{record.checkOutTime ? formatTime(record.checkOutTime) : '—'}</TableCell>
                        <TableCell>{record.totalWorkHours.toFixed(2)}</TableCell>
                        <TableCell className={record.overtimeHours > 0 ? 'text-purple-600 font-medium' : ''}>
                          {record.overtimeHours.toFixed(2)}
                        </TableCell>
                        <TableCell className={record.lateMinutes > 0 ? 'text-orange-600 font-medium' : ''}>
                          {record.lateMinutes > 0 ? `${record.lateMinutes} د` : '—'}
                        </TableCell>
                        <TableCell className={record.earlyLeaveMinutes > 0 ? 'text-red-600 font-medium' : ''}>
                          {record.earlyLeaveMinutes > 0 ? `${record.earlyLeaveMinutes} د` : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>{getStatusLabel(record.status)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

function StatCard({
  title,
  value,
  color,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
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

// Import icons
import { CheckCircle2, XCircle, Clock, LogOut, TrendingUp } from 'lucide-react';
import { getDayName } from '@/lib/utils';