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
import { Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle2, XCircle, Clock, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { cn, formatDate, getStatusColor, getStatusLabel, getLeaveTypeLabel } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getLeaveRecords, getLeaveBalances, createLeaveRequest, approveLeave, rejectLeave, cancelLeave, initializeLeaveBalances } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';

const leaveSchema = z.object({
  leaveType: z.enum(['annual', 'sick', 'casual', 'maternity', 'paternity', 'marriage', 'hajj', 'study', 'unpaid', 'compensatory', 'other']),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

const LEAVE_TYPES = [
  { value: 'annual', label: 'سنوية' },
  { value: 'sick', label: 'مرضية' },
  { value: 'casual', label: 'عرضية' },
  { value: 'maternity', label: 'أمومة' },
  { value: 'paternity', label: 'أبوة' },
  { value: 'marriage', label: 'زواج' },
  { value: 'hajj', label: 'حج' },
  { value: 'study', label: 'دراسية' },
  { value: 'unpaid', label: 'بدون راتب' },
  { value: 'compensatory', label: 'تعويضية' },
  { value: 'other', label: 'أخرى' },
];

export default function LeavesPage() {
  const { user } = useAuth();
  const { leaveRecords, setLeaveRecords, leaveBalances, setLeaveBalances, isLoading, setIsLoading, settings, currentDate } = useAppStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLeave, setEditingLeave] = React.useState<typeof leaveRecords[0] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: 'annual',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, selectedYear]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [records, balances] = await Promise.all([
        getLeaveRecords(user.uid, selectedYear),
        getLeaveBalances(user.uid, selectedYear),
      ]);
      setLeaveRecords(records);
      setLeaveBalances(balances);
    } catch (error) {
      console.error('Failed to load leaves:', error);
      toast.error('فشل في تحميل الإجازات');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LeaveFormData) => {
    if (!user) return;
    try {
      await createLeaveRequest(user.uid, {
        leaveType: data.leaveType,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        totalDays: Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        reason: data.reason,
        status: 'pending',
      });
      toast.success('تم تقديم طلب الإجازة');
      setShowAddDialog(false);
      reset();
      loadData();
    } catch (error) {
      console.error('Failed to create leave:', error);
      toast.error('فشل في تقديم الطلب');
    }
  };

  const handleApprove = async (leaveId: string) => {
    if (!user) return;
    try {
      await approveLeave(user.uid, leaveId, user.displayName || 'المدير');
      toast.success('تم اعتماد الإجازة');
      loadData();
    } catch (error) {
      toast.error('فشل في الاعتماد');
    }
  };

  const handleReject = async (leaveId: string) => {
    if (!user) return;
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    try {
      await rejectLeave(user.uid, leaveId, reason);
      toast.success('تم رفض الإجازة');
      loadData();
    } catch (error) {
      toast.error('فشل في الرفض');
    }
  };

  const handleCancel = async (leaveId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذه الإجازة؟')) return;
    if (!user) return;
    try {
      await cancelLeave(user.uid, leaveId);
      toast.success('تم إلغاء الإجازة');
      loadData();
    } catch (error) {
      toast.error('فشل في الإلغاء');
    }
  };

  const goToPreviousYear = () => setSelectedYear(y => y - 1);
  const goToNextYear = () => setSelectedYear(y => y + 1);
  const goToCurrentYear = () => setSelectedYear(new Date().getFullYear());

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={goToPreviousYear}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">الإجازات - {selectedYear}</h1>
                  <p className="text-sm text-muted-foreground">إدارة طلبات الإجازات والرصيد</p>
                </div>
                <Button variant="outline" size="icon" onClick={goToNextYear}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={goToCurrentYear}>
                  <Calendar className="h-4 w-4 mr-1" />
                  السنة الحالية
                </Button>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  طلب إجازة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              رصيد الإجازات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {leaveBalances.map((balance) => (
                <div key={balance.leaveType} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{getLeaveTypeLabel(balance.leaveType)}</span>
                    <Badge variant={Math.max(0, balance.totalEntitled + balance.carriedForward - balance.usedDays) <= 2 ? 'destructive' : 'success'}>
                      {Math.max(0, balance.totalEntitled + balance.carriedForward - balance.usedDays)} / {balance.totalEntitled}
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${balance.totalEntitled > 0 ? (balance.usedDays / balance.totalEntitled) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>مستخدم: {balance.usedDays}</span>
                    <span>متبقي: {Math.max(0, balance.totalEntitled + balance.carriedForward - balance.usedDays)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>طلبات الإجازات ({leaveRecords.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">معلقة</SelectItem>
                  <SelectItem value="approved">معتمدة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : leaveRecords.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد طلبات إجازة لهذا العام</p>
                <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-1" />
                  طلب إجازة جديدة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>النوع</TableHead>
                      <TableHead>من</TableHead>
                      <TableHead>إلى</TableHead>
                      <TableHead>الأيام</TableHead>
                      <TableHead>السبب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الموافقة بواسطة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRecords.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell><Badge variant="info">{getLeaveTypeLabel(leave.leaveType)}</Badge></TableCell>
                        <TableCell>{formatDate(leave.startDate)}</TableCell>
                        <TableCell>{formatDate(leave.endDate)}</TableCell>
                        <TableCell>{leave.totalDays}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{leave.reason || '—'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(leave.status)}>{getStatusLabel(leave.status)}</Badge>
                        </TableCell>
                        <TableCell>{leave.approvedBy || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {leave.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleApprove(leave.id)} title="اعتماد">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleReject(leave.id)} title="رفض">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            {leave.status === 'approved' && (
                              <Button variant="ghost" size="icon" onClick={() => handleCancel(leave.id)} title="إلغاء">
                                <Trash2 className="h-4 w-4 text-gray-600" />
                              </Button>
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

        {/* Add Leave Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>طلب إجازة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="leaveType">نوع الإجازة</Label>
                  <Select
                    value={watch('leaveType')}
                    onValueChange={(value) => setValue('leaveType', leaveSchema.shape.leaveType.parse(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.leaveType && <p className="text-sm text-red-500">{errors.leaveType.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">من تاريخ</Label>
                    <Input
                      type="date"
                      {...register('startDate', { valueAsDate: true })}
                      className="w-full"
                    />
                    {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="endDate">إلى تاريخ</Label>
                    <Input
                      type="date"
                      {...register('endDate', { valueAsDate: true })}
                      className="w-full"
                    />
                    {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">السبب (اختياري)</Label>
                  <Input
                    {...register('reason')}
                    placeholder="سبب الإجازة..."
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