'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, User, Clock, DollarSign, Bell, Shield, FileText, RefreshCw, Database } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { updateUserSettings, initializeLeaveBalances } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  employeeName: z.string().min(1, 'الاسم مطلوب'),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.date(),
  workStartTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  workEndTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  breakDurationMinutes: z.number().min(0).max(480),
  weeklyWorkHours: z.number().min(1).max(80),
  workDaysPerWeek: z.number().min(1).max(7),
  weekendDay: z.enum(['5', '6']),
  overtimeRateNormal: z.number().min(1).max(3),
  overtimeRateWeekend: z.number().min(1).max(3),
  overtimeRateHoliday: z.number().min(1).max(3),
  maxOvertimeHoursPerMonth: z.number().min(0).max(200),
  checkInReminderEnabled: z.boolean(),
  checkInReminderTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  checkOutReminderEnabled: z.boolean(),
  checkOutReminderTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  overtimeAlertEnabled: z.boolean(),
  leaveBalanceAlertEnabled: z.boolean(),
  googleSheetsEnabled: z.boolean(),
  googleSheetsSpreadsheetId: z.string().optional(),
  googleSheetsAutoSync: z.boolean(),
  googleSheetsSyncFrequencyHours: z.number().min(1).max(168),
  biometricEnabled: z.boolean(),
  pinEnabled: z.boolean(),
  pdfExportPath: z.string().optional(),
  pdfIncludeLocation: z.boolean(),
  pdfLanguage: z.enum(['ar', 'en']),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, setSettings, updateSettings, isLoading, setIsLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState('employee');
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (settings) {
      setValue('employeeName', settings.employeeName);
      setValue('employeeId', settings.employeeId);
      setValue('department', settings.department);
      setValue('position', settings.position);
      setValue('hireDate', new Date(settings.hireDate));
      setValue('workStartTime', settings.workStartTime);
      setValue('workEndTime', settings.workEndTime);
      setValue('breakDurationMinutes', settings.breakDurationMinutes);
      setValue('weeklyWorkHours', settings.weeklyWorkHours);
      setValue('workDaysPerWeek', settings.workDaysPerWeek);
      setValue('weekendDay', settings.weekendDay === 5 ? '5' : '6');
      setValue('overtimeRateNormal', settings.overtimeRateNormal);
      setValue('overtimeRateWeekend', settings.overtimeRateWeekend);
      setValue('overtimeRateHoliday', settings.overtimeRateHoliday);
      setValue('maxOvertimeHoursPerMonth', settings.maxOvertimeHoursPerMonth);
      setValue('checkInReminderEnabled', settings.checkInReminderEnabled);
      setValue('checkInReminderTime', settings.checkInReminderTime);
      setValue('checkOutReminderEnabled', settings.checkOutReminderEnabled);
      setValue('checkOutReminderTime', settings.checkOutReminderTime);
      setValue('overtimeAlertEnabled', settings.overtimeAlertEnabled);
      setValue('leaveBalanceAlertEnabled', settings.leaveBalanceAlertEnabled);
      setValue('googleSheetsEnabled', settings.googleSheetsEnabled);
      setValue('googleSheetsSpreadsheetId', settings.googleSheetsSpreadsheetId);
      setValue('googleSheetsAutoSync', settings.googleSheetsAutoSync);
      setValue('googleSheetsSyncFrequencyHours', settings.googleSheetsSyncFrequencyHours);
      setValue('biometricEnabled', settings.biometricEnabled);
      setValue('pinEnabled', settings.pinEnabled);
      setValue('pdfExportPath', settings.pdfExportPath);
      setValue('pdfIncludeLocation', settings.pdfIncludeLocation);
      setValue('pdfLanguage', settings.pdfLanguage);
    }
  }, [settings, setValue]);

  const onSubmit = async (data: SettingsFormData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const changes = {
        ...data,
        weekendDay: data.weekendDay === '5' ? 5 as const : 6 as const,
        hireDate: data.hireDate.toISOString().split('T')[0],
      };
      await updateUserSettings(user.uid, changes);
      updateSettings(changes);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!user || !settings || !confirm('سيتم إعادة تعيين جميع الإعدادات للقيم الافتراضية. هل تريد المتابعة؟')) return;
    setIsLoading(true);
    try {
      await updateUserSettings(user.uid, DEFAULT_SETTINGS);
      setSettings({ ...settings, ...DEFAULT_SETTINGS });
      toast.success('تم تهيئة الإعدادات الافتراضية');
    } catch (error) {
      toast.error('فشل في التهيئة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeBalances = async () => {
    if (!user || !settings || !confirm('سيتم إنشاء أرصدة الإجازات للسنة الحالية. هل تريد المتابعة؟')) return;
    setIsLoading(true);
    try {
      await initializeLeaveBalances(user.uid, new Date().getFullYear(), settings);
      toast.success('تم تهيئة أرصدة الإجازات');
    } catch (error) {
      toast.error('فشل في التهيئة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
            <p className="text-muted-foreground">تخصيص تطبيق الحضور والانصراف</p>
          </div>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || !isDirty}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="employee"><User className="h-4 w-4 mr-1" /> الموظف</TabsTrigger>
              <TabsTrigger value="schedule"><Clock className="h-4 w-4 mr-1" /> الدوام</TabsTrigger>
              <TabsTrigger value="overtime"><DollarSign className="h-4 w-4 mr-1" /> الأوفر تايم</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" /> الإشعارات</TabsTrigger>
              <TabsTrigger value="sync"><RefreshCw className="h-4 w-4 mr-1" /> المزامنة</TabsTrigger>
              <TabsTrigger value="security"><Shield className="h-4 w-4 mr-1" /> الأمان</TabsTrigger>
            </TabsList>

            {/* Employee Info */}
            <TabsContent value="employee">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلومات الموظف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="employeeName">الاسم *</Label>
                      <Input
                        {...register('employeeName')}
                        placeholder="أحمد محمد"
                      />
                      {errors.employeeName && <p className="text-sm text-red-500">{errors.employeeName.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="employeeId">الرقم الوظيفي</Label>
                      <Input {...register('employeeId')} placeholder="EMP001" />
                    </div>
                    <div>
                      <Label htmlFor="department">القسم</Label>
                      <Input {...register('department')} placeholder="تقنية المعلومات" />
                    </div>
                    <div>
                      <Label htmlFor="position">المسمى الوظيفي</Label>
                      <Input {...register('position')} placeholder="مطور برمجيات" />
                    </div>
                    <div>
                      <Label htmlFor="hireDate">تاريخ التعيين</Label>
                      <Input
                        type="date"
                        {...register('hireDate', { valueAsDate: true })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Schedule */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    جدول العمل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="workStartTime">وقت الحضور</Label>
                      <Input type="time" {...register('workStartTime')} />
                    </div>
                    <div>
                      <Label htmlFor="workEndTime">وقت الانصراف</Label>
                      <Input type="time" {...register('workEndTime')} />
                    </div>
                    <div>
                      <Label htmlFor="breakDurationMinutes">مدة الاستراحة (دقيقة)</Label>
                      <Input type="number" {...register('breakDurationMinutes', { valueAsNumber: true })} min={0} max={480} />
                    </div>
                    <div>
                      <Label htmlFor="weeklyWorkHours">ساعات العمل الأسبوعية</Label>
                      <Input type="number" {...register('weeklyWorkHours', { valueAsNumber: true })} min={1} max={80} />
                    </div>
                    <div>
                      <Label htmlFor="workDaysPerWeek">أيام العمل الأسبوعية</Label>
                      <Input type="number" {...register('workDaysPerWeek', { valueAsNumber: true })} min={1} max={7} />
                    </div>
                    <div>
                      <Label htmlFor="weekendDay">يوم العطلة الأسبوعية</Label>
                      <Select value={watch('weekendDay')} onValueChange={(value) => setValue('weekendDay', settingsSchema.shape.weekendDay.parse(value), { shouldDirty: true })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">الجمعة</SelectItem>
                          <SelectItem value="6">السبت</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Overtime Settings */}
            <TabsContent value="overtime">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    إعدادات الأوفر تايم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="overtimeRateNormal">معدل الأوفر تايم العادي</Label>
                      <Input type="number" step="0.1" {...register('overtimeRateNormal', { valueAsNumber: true })} min={1} max={3} />
                    </div>
                    <div>
                      <Label htmlFor="overtimeRateWeekend">معدل عطلة نهاية الأسبوع</Label>
                      <Input type="number" step="0.1" {...register('overtimeRateWeekend', { valueAsNumber: true })} min={1} max={3} />
                    </div>
                    <div>
                      <Label htmlFor="overtimeRateHoliday">معدل العطلات الرسمية</Label>
                      <Input type="number" step="0.1" {...register('overtimeRateHoliday', { valueAsNumber: true })} min={1} max={3} />
                    </div>
                    <div>
                      <Label htmlFor="maxOvertimeHoursPerMonth">الحد الأقصى للساعات الشهرية</Label>
                      <Input type="number" {...register('maxOvertimeHoursPerMonth', { valueAsNumber: true })} min={0} max={200} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    الإشعارات والتذكيرات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>تذكير الحضور</Label>
                        <p className="text-sm text-muted-foreground">إشعار قبل وقت الحضور المحدد</p>
                      </div>
                      <Switch
                        checked={watch('checkInReminderEnabled')}
                        onCheckedChange={(checked) => setValue('checkInReminderEnabled', checked)}
                      />
                    </div>
                    {watch('checkInReminderEnabled') && (
                      <div>
                        <Label htmlFor="checkInReminderTime">وقت تذكير الحضور</Label>
                        <Input type="time" {...register('checkInReminderTime')} />
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>تذكير الانصراف</Label>
                        <p className="text-sm text-muted-foreground">إشعار قبل وقت الانصراف المحدد</p>
                      </div>
                      <Switch
                        checked={watch('checkOutReminderEnabled')}
                        onCheckedChange={(checked) => setValue('checkOutReminderEnabled', checked)}
                      />
                    </div>
                    {watch('checkOutReminderEnabled') && (
                      <div>
                        <Label htmlFor="checkOutReminderTime">وقت تذكير الانصراف</Label>
                        <Input type="time" {...register('checkOutReminderTime')} />
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>تنبيه الأوفر تايم</Label>
                        <p className="text-sm text-muted-foreground">عند تجاوز الحد الشهري المحدد</p>
                      </div>
                      <Switch
                        checked={watch('overtimeAlertEnabled')}
                        onCheckedChange={(checked) => setValue('overtimeAlertEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>تنبيه رصيد الإجازات</Label>
                        <p className="text-sm text-muted-foreground">عند انخفاض الرصيد عن حد معين</p>
                      </div>
                      <Switch
                        checked={watch('leaveBalanceAlertEnabled')}
                        onCheckedChange={(checked) => setValue('leaveBalanceAlertEnabled', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Google Sheets Sync */}
            <TabsContent value="sync">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    مزامنة Google Sheets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>تفعيل المزامنة</Label>
                        <p className="text-sm text-muted-foreground">مزامنة البيانات مع Google Sheets تلقائياً</p>
                      </div>
                      <Switch
                        checked={watch('googleSheetsEnabled')}
                        onCheckedChange={(checked) => setValue('googleSheetsEnabled', checked)}
                      />
                    </div>

                    {watch('googleSheetsEnabled') && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <Label htmlFor="googleSheetsSpreadsheetId">معرف الجدول (Spreadsheet ID)</Label>
                          <Input
                            {...register('googleSheetsSpreadsheetId')}
                            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                          />
                          <p className="text-sm text-muted-foreground">موجود في رابط الجدول: docs.google.com/spreadsheets/d/[ID]/edit</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>مزامنة تلقائية</Label>
                            <p className="text-sm text-muted-foreground">مزامنة البيانات دورياً في الخلفية</p>
                          </div>
                          <Switch
                            checked={watch('googleSheetsAutoSync')}
                            onCheckedChange={(checked) => setValue('googleSheetsAutoSync', checked)}
                          />
                        </div>

                        {watch('googleSheetsAutoSync') && (
                          <div>
                            <Label htmlFor="googleSheetsSyncFrequencyHours">تكرار المزامنة (ساعات)</Label>
                            <Input type="number" {...register('googleSheetsSyncFrequencyHours', { valueAsNumber: true })} min={1} max={168} />
                          </div>
                        )}

                        <div>
                          <Label>آخر مزامنة</Label>
                          <p className="text-sm text-muted-foreground">{settings?.lastSyncedAt ? formatDate(settings.lastSyncedAt) : 'لم تتم مزامنة بعد'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    الأمان والمصادقة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>المصادقة الحيوية</Label>
                        <p className="text-sm text-muted-foreground">بصمة الإصبع أو التعرف على الوجه</p>
                      </div>
                      <Switch
                        checked={watch('biometricEnabled')}
                        onCheckedChange={(checked) => setValue('biometricEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>كود الدخول (PIN)</Label>
                        <p className="text-sm text-muted-foreground">حماية التطبيق برمز مكون من 4-6 أرقام</p>
                      </div>
                      <Switch
                        checked={watch('pinEnabled')}
                        onCheckedChange={(checked) => setValue('pinEnabled', checked)}
                      />
                    </div>

                    {watch('pinEnabled') && (
                      <Button type="button" variant="outline" onClick={() => toast('ميزة تغيير PIN قيد التطوير')}>
                        تغيير كود الدخول
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PDF Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    تصدير PDF
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pdfExportPath">مسار الحفظ</Label>
                      <Input {...register('pdfExportPath')} placeholder="AttendanceReports" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>تضمين الموقع</Label>
                        <p className="text-sm text-muted-foreground">إضافة إحداثيات الموقع في التقارير</p>
                      </div>
                      <Switch
                        checked={watch('pdfIncludeLocation')}
                        onCheckedChange={(checked) => setValue('pdfIncludeLocation', checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="pdfLanguage">لغة التقرير</Label>
                      <Select value={watch('pdfLanguage')} onValueChange={(value) => setValue('pdfLanguage', settingsSchema.shape.pdfLanguage.parse(value), { shouldDirty: true })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر اللغة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    إدارة البيانات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleInitializeDefaults}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      تهيئة الإعدادات الافتراضية
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleInitializeBalances}
                      disabled={isLoading}
                    >
                      <Database className="h-4 w-4 mr-1" />
                      تهيئة أرصدة الإجازات
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>تحذير:</strong> هذه العمليات لا يمكن التراجع عنها. يرجى أخذ نسخة احتياطية قبل التنفيذ.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </MainLayout>
  );
}
