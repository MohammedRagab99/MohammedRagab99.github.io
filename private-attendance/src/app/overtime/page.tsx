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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Plus, CheckCircle2, XCircle, Clock, AlertCircle, Trash2, Edit2, DollarSign } from 'lucide-react';
import { cn, formatDate, getStatusColor, getStatusLabel, getOvertimeTypeLabel } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getOvertimeRecords, createOvertimeRequest, approveOvertime, rejectOvertime } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';

const overtimeSchema = z.object({
  date: z.date(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة (HH:mm)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة (HH:mm)'),
  overtimeType: z.enum(['regular', 'weekend', 'holiday', 'night_shift', 'emergency']),
  reason: z.string().optional(),
});

type OvertimeFormData = z.infer<typeof overtimeSchema>;

const OVERTIME_TYPES = [
  { value: 'regular', label: 'عادي' },
  { value: 'weekend', label: 'عطلة أسبوعية' },
  { value: 'holiday', label: 'عطلة رسمية' },
  { value: 'night_shift', label: 'وردية ليلية' },
  { value: 'emergency', label: 'طوارئ' },
];

export default function OvertimePage() {
  const { user } = useAuth();
  const { overtimeRecords, setOvertimeRecords, isLoading, setIsLoading, settings, currentDate } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [stats, setStats] = useState<{
    totalHours: number;
    approvedHours: number;
    calculatedHours: number;
    pendingCount: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OvertimeFormData>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: {
      date: new Date(),
      startTime: '17:00',
      endTime: '19:00',
      overtimeType: 'regular',
      reason: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, selectedMonth]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const records = await getOvertimeRecords(user.uid, selectedMonth);
      setOvertimeRecords(records);

      const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);
      const approvedHours = records.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalHours, 0);
      const calculatedHours = records.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalHours * r.rateMultiplier, 0);
      const pendingCount = records.filter(r => r.status === 'pending').length;

      setStats({ totalHours, approvedHours, calculatedHours, pendingCount });
    } catch (error) {
      console.error('Failed to load overtime:', error);
      toast.error('فشل في تحميل الأوفر تايم');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: OvertimeFormData) => {
    if (!user || !settings) return;
    try {
      const startTime = new Date(data.date);
      const [sh, sm] = data.startTime.split(':').map(Number);
      startTime.setHours(sh, sm, 0, 0);

      const endTime = new Date(data.date);
      const [eh, em] = data.endTime.split(':').map(Number);
      endTime.setHours(eh, em, 0, 0);

      const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      const totalHours = totalMinutes / 60;

      let rateMultiplier = settings.overtimeRateNormal;
      switch (data.overtimeType) {
        case 'weekend': rateMultiplier = settings.overtimeRateWeekend; break;
        case 'holiday': rateMultiplier = settings.overtimeRateHoliday; break;
        case 'night_shift': rateMultiplier = settings.overtimeRateNormal * 1.25; break;
        case 'emergency': rateMultiplier = settings.overtimeRateHoliday; break;
      }

      await createOvertimeRequest(user.uid, {
        date: data.date.toISOString().split('T')[0],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalHours,
        overtimeType: data.overtimeType,
        rateMultiplier,
        compensatoryLeaveGranted: false,
        compensatoryLeaveDays: 0,
        reason: data.reason,
        status: 'pending',
      });
      toast.success('تم تقديم طلب الأوفر تايم');
      setShowAddDialog(false);
      reset();
      loadData();
    } catch (error) {
      console.error('Failed to create overtime:', error);
      toast.error('فشل في تقديم الطلب');
    }
  };

  const handleApprove = async (overtimeId: string, grantCompensatory: boolean = false) => {
    if (!user) return;
    try {
      await approveOvertime(user.uid, overtimeId, user.displayName || 'المدير', grantCompensatory);
      toast.success(grantCompensatory ? 'تم الاعتماد مع إجازة تعويضية' : 'تم اعتماد الأوفر تايم');
      loadData();
    } catch (error) {
      toast.error('فشل في الاعتماد');
    }
  };

  const handleReject = async (overtimeId: string) => {
    if (!user) return;
    try {
      await rejectOvertime(user.uid, overtimeId);
      toast.success('تم رفض الأوفر تايم');
      loadData();
    } catch (error) {
      toast.error('فشل في الرفض');
    }
  };

  const goToPreviousMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const goToCurrentMonth = () => {
    const date = new Date();
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthName = getMonthName(month);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">الأوفر تايم - {monthName} {year}</h1>
                  <p className="text-sm text-muted-foreground">إدارة ساعات العمل الإضافي</p>
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
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  طلب أوفر تايم
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="إجمالي الساعات" value={stats.totalHours.toFixed(1)} color="text-blue-600 bg-blue-100 dark:bg-blue-900/30" icon={Clock} />
            <StatCard title="معتمدة" value={stats.approvedHours.toFixed(1)} color="text-green-600 bg-green-100 dark:bg-green-900/30" icon={CheckCircle2} />
            <StatCard title="محتسبة" value={stats.calculatedHours.toFixed(1)} color="text-purple-600 bg-purple-100 dark:bg-purple-900/30" icon={DollarSign} />
            <StatCard title="معلقة" value={stats.pendingCount} color="text-orange-600 bg-orange-100 dark:bg-orange-900/30" icon={Clock} />
          </div>
        )}

        {/* Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>طلبات الأوفر تايم ({overtimeRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : overtimeRecords.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد طلبات أوفر تايم لهذا الشهر</p>
                <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-1" />
                  طلب أوفر تايم جديد
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>من</TableHead>
                      <TableHead>إلى</TableHead>
                      <TableHead>الساعات</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>المضاعف</TableHead>
                      <TableHead>محتسب</TableHead>
                      <TableHead>السبب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overtimeRecords.map((ot) => (
                      <TableRow key={ot.id}>
                        <TableCell>{formatDate(ot.date)}</TableCell>
                        <TableCell>{ot.startTime ? new Date(ot.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell>{ot.endTime ? new Date(ot.endTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell>{ot.totalHours.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="info">{getOvertimeTypeLabel(ot.overtimeType)}</Badge></TableCell>
                        <TableCell>{ot.rateMultiplier}x</TableCell>
                        <TableCell className="font-medium text-purple-600">{(ot.totalHours * ot.rateMultiplier).toFixed(2)}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{ot.reason || '—'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ot.status)}>{getStatusLabel(ot.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {ot.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleApprove(ot.id, false)} title="اعتماد">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleApprove(ot.id, true)} title="اعتماد + إجازة تعويضية">
                                  <DollarSign className="h-4 w-4 text-purple-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleReject(ot.id)} title="رفض">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Overtime Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>طلب أوفر تايم جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    type="date"
                    {...register('date', { valueAsDate: true })}
                    className="w-full"
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">من</Label>
                    <Input
                      type="time"
                      {...register('startTime')}
                      className="w-full"
                    />
                    {errors.startTime && <p className="text-sm text-red-500">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="endTime">إلى</Label>
                    <Input
                      type="time"
                      {...register('endTime')}
                      className="w-full"
                    />
                    {errors.endTime && <p className="text-sm text-red-500">{errors.endTime.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="overtimeType">النوع</Label>
                  <Select
                    value={watch('overtimeType')}
                    onValueChange={(value) => setValue('overtimeType', overtimeSchema.shape.overtimeType.parse(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      {OVERTIME_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.overtimeType && <p className="text-sm text-red-500">{errors.overtimeType.message}</p>}
                </div>

                <div>
                  <Label htmlFor="reason">السبب (اختياري)</Label>
                  <Input
                    {...register('reason')}
                    placeholder="سبب الأوفر تايم..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-1" />
                  تقديم الطلب
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '@/lib/utils';