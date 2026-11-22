'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Download, FileText, ChevronLeft, ChevronRight, TrendingUp, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn, formatDate, getMonthName, parseYearMonth, startOfWeek, endOfWeek, formatHours, getStatusLabel, getStatusColor } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getAttendanceRecords, getLeaveRecords, getOvertimeRecords, getAttendanceStats } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import toast from 'react-hot-toast';

type ReportType = 'weekly' | 'monthly' | 'annual';

export default function ReportsPage() {
  const { user } = useAuth();
  const { settings, attendanceRecords, leaveRecords, overtimeRecords, reportType, setReportType, reportPreview, setReportPreview, isLoading, setIsLoading, currentDate, setCurrentDate } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<{
    totalWorkHours: number;
    totalOvertimeHours: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    attendanceRate: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadPreview();
  }, [user, reportType, selectedDate]);

  const loadPreview = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let startDate: Date, endDate: Date;
      const dateStr = selectedDate.toISOString().split('T')[0];

      switch (reportType) {
        case 'weekly':
          startDate = startOfWeek(selectedDate);
          endDate = endOfWeek(selectedDate);
          break;
        case 'monthly':
          startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
          break;
        case 'annual':
          startDate = new Date(selectedDate.getFullYear(), 0, 1);
          endDate = new Date(selectedDate.getFullYear(), 11, 31);
          break;
      }

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const [attRecords, leaveRecs, otRecords, stats] = await Promise.all([
        getAttendanceRecords(user.uid, startStr, endStr),
        getLeaveRecords(user.uid, selectedDate.getFullYear()),
        getOvertimeRecords(user.uid, `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`),
        getAttendanceStats(user.uid, startStr, endStr),
      ]);

      const filteredLeaves = leaveRecs.filter(l => {
        const leaveStart = new Date(l.startDate);
        return leaveStart >= startDate && leaveStart <= endDate && l.status === 'approved';
      });

      const presentDays = attRecords.filter(r => r.status === 'present').length;
      const absentDays = attRecords.filter(r => r.status === 'absent').length;
      const lateDays = attRecords.filter(r => r.status === 'late').length;
      const totalWorkHours = attRecords.reduce((sum, r) => sum + r.totalWorkHours, 0);
      const totalOvertimeHours = attRecords.reduce((sum, r) => sum + r.overtimeHours, 0) +
        otRecords.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalHours, 0);
      const leaveDays = filteredLeaves.reduce((sum, l) => sum + l.totalDays, 0);

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      const preview = {
        totalWorkHours,
        totalOvertimeHours,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        attendanceRate,
      };

      setPreviewData(preview);
      setReportPreview(preview);
    } catch (error) {
      console.error('Failed to load preview:', error);
      toast.error('فشل في تحميل المعاينة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setCurrentDate(newDate);
  };

  const generatePDF = async () => {
    if (!user || !settings) return;
    setIsGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Add Arabic font support
      doc.addFont('https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/files/cairo-arabic-400-normal.woff2', 'Cairo', 'normal');
      doc.addFont('https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/files/cairo-arabic-700-normal.woff2', 'Cairo', 'bold');
      doc.setFont('Cairo');

      let startDate: Date, endDate: Date, fileName: string;

      switch (reportType) {
        case 'weekly':
          startDate = startOfWeek(selectedDate);
          endDate = endOfWeek(selectedDate);
          fileName = `Weekly_Report_${startDate.getFullYear()}_W${getWeekNumber(startDate)}.pdf`;
          break;
        case 'monthly':
          startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
          fileName = `Monthly_Report_${selectedDate.getFullYear()}_${String(selectedDate.getMonth() + 1).padStart(2, '0')}.pdf`;
          break;
        case 'annual':
          startDate = new Date(selectedDate.getFullYear(), 0, 1);
          endDate = new Date(selectedDate.getFullYear(), 11, 31);
          fileName = `Annual_Report_${selectedDate.getFullYear()}.pdf`;
          break;
      }

      // Title
      doc.setFontSize(24);
      doc.setFont('Cairo', 'bold');
      doc.setTextColor(46, 125, 50); // Primary green
      const title = settings.pdfLanguage === 'ar'
        ? `تقرير ${reportType === 'weekly' ? 'أسبوعي' : reportType === 'monthly' ? 'شهري' : 'سنوي'} - ${formatDateRange(startDate, endDate)}`
        : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${formatDateRange(startDate, endDate)}`;
      doc.text(title, 140, 20, { align: 'center' });

      // Employee info
      doc.setFontSize(12);
      doc.setFont('Cairo', 'normal');
      doc.setTextColor(100, 100, 100);
      const empInfo = settings.pdfLanguage === 'ar'
        ? `الموظف: ${settings.employeeName} | الرقم: ${settings.employeeId} | القسم: ${settings.department}`
        : `Employee: ${settings.employeeName} | ID: ${settings.employeeId} | Dept: ${settings.department}`;
      doc.text(empInfo, 140, 30, { align: 'center' });

      // Summary table
      if (previewData) {
        doc.setFontSize(14);
        doc.setFont('Cairo', 'bold');
        doc.setTextColor(46, 125, 50);
        doc.text(settings.pdfLanguage === 'ar' ? 'ملخص التقرير' : 'Report Summary', 140, 40, { align: 'center' });

        const summaryData = [
          [settings.pdfLanguage === 'ar' ? 'أيام الحضور' : 'Present Days', previewData.presentDays.toString()],
          [settings.pdfLanguage === 'ar' ? 'أيام الغياب' : 'Absent Days', previewData.absentDays.toString()],
          [settings.pdfLanguage === 'ar' ? 'أيام التأخير' : 'Late Days', previewData.lateDays.toString()],
          [settings.pdfLanguage === 'ar' ? 'أيام الإجازات' : 'Leave Days', previewData.leaveDays.toString()],
          [settings.pdfLanguage === 'ar' ? 'إجمالي ساعات العمل' : 'Total Work Hours', previewData.totalWorkHours.toFixed(2)],
          [settings.pdfLanguage === 'ar' ? 'إجمالي الأوفر تايم' : 'Total Overtime', previewData.totalOvertimeHours.toFixed(2)],
          [settings.pdfLanguage === 'ar' ? 'نسبة الحضور' : 'Attendance Rate', `${previewData.attendanceRate.toFixed(1)}%`],
        ];

        autoTable(doc, {
          startY: 45,
          head: [[settings.pdfLanguage === 'ar' ? 'البند' : 'Item', settings.pdfLanguage === 'ar' ? 'القيمة' : 'Value']],
          body: summaryData,
          theme: 'striped',
          headStyles: { fillColor: [46, 125, 50], font: 'Cairo', fontStyle: 'bold' },
          bodyStyles: { font: 'Cairo' },
          styles: { font: 'Cairo' },
          columnStyles: { 0: { fontStyle: 'bold' } },
        });
      }

      // Attendance details table
      const attRecords = attendanceRecords;
      if (attRecords.length > 0) {
        const finalY = (doc as any).lastAutoTable?.finalY || 80;

        doc.setFontSize(14);
        doc.setFont('Cairo', 'bold');
        doc.setTextColor(46, 125, 50);
        doc.text(settings.pdfLanguage === 'ar' ? 'تفاصيل الحضور' : 'Attendance Details', 140, finalY + 10, { align: 'center' });

        const tableData = attRecords.map(r => [
          formatDate(r.date),
          getDayName(r.date),
          r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—',
          r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—',
          r.totalWorkHours.toFixed(2),
          r.overtimeHours.toFixed(2),
          r.lateMinutes > 0 ? `${r.lateMinutes} د` : '—',
          r.earlyLeaveMinutes > 0 ? `${r.earlyLeaveMinutes} د` : '—',
          getStatusLabel(r.status, settings.pdfLanguage),
          r.notes || '',
        ]);

        autoTable(doc, {
          startY: finalY + 15,
          head: [[
            settings.pdfLanguage === 'ar' ? 'التاريخ' : 'Date',
            settings.pdfLanguage === 'ar' ? 'اليوم' : 'Day',
            settings.pdfLanguage === 'ar' ? 'الحضور' : 'Check In',
            settings.pdfLanguage === 'ar' ? 'الانصراف' : 'Check Out',
            settings.pdfLanguage === 'ar' ? 'ساعات العمل' : 'Work Hours',
            settings.pdfLanguage === 'ar' ? 'أوفر تايم' : 'Overtime',
            settings.pdfLanguage === 'ar' ? 'تأخير' : 'Late',
            settings.pdfLanguage === 'ar' ? 'انصراف مبكر' : 'Early Leave',
            settings.pdfLanguage === 'ar' ? 'الحالة' : 'Status',
            settings.pdfLanguage === 'ar' ? 'ملاحظات' : 'Notes',
          ]],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [46, 125, 50], font: 'Cairo', fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { font: 'Cairo', fontSize: 7 },
          styles: { font: 'Cairo', cellPadding: 2 },
          columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 20 } },
        });
      }

      doc.save(fileName);
      toast.success('تم إنشاء التقرير بنجاح');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('فشل في إنشاء التقرير');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    if (settings?.pdfLanguage === 'ar') {
      return `${start.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const goToPreviousPeriod = () => {
    const newDate = new Date(selectedDate);
    switch (reportType) {
      case 'weekly': newDate.setDate(newDate.getDate() - 7); break;
      case 'monthly': newDate.setMonth(newDate.getMonth() - 1); break;
      case 'annual': newDate.setFullYear(newDate.getFullYear() - 1); break;
    }
    handleDateChange(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(selectedDate);
    switch (reportType) {
      case 'weekly': newDate.setDate(newDate.getDate() + 7); break;
      case 'monthly': newDate.setMonth(newDate.getMonth() + 1); break;
      case 'annual': newDate.setFullYear(newDate.getFullYear() + 1); break;
    }
    handleDateChange(newDate);
  };

  const getPeriodLabel = () => {
    switch (reportType) {
      case 'weekly': {
        const start = startOfWeek(selectedDate);
        const end = endOfWeek(selectedDate);
        return `أسبوع ${start.getDate()} ${getMonthName(start.getMonth() + 1)} - ${end.getDate()} ${getMonthName(end.getMonth() + 1)} ${end.getFullYear()}`;
      }
      case 'monthly':
        return `${getMonthName(selectedDate.getMonth() + 1)} ${selectedDate.getFullYear()}`;
      case 'annual':
        return `${selectedDate.getFullYear()}`;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={goToPreviousPeriod}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">التقارير</h1>
                  <p className="text-sm text-muted-foreground">{getPeriodLabel()}</p>
                </div>
                <Button variant="outline" size="icon" onClick={goToNextPeriod}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Type Tabs */}
        <Card>
          <CardContent className="p-2">
            <Tabs value={reportType} onValueChange={setReportType as any} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">
                  <Calendar className="h-4 w-4 mr-1" />
                  أسبوعي
                </TabsTrigger>
                <TabsTrigger value="monthly">
                  <Calendar className="h-4 w-4 mr-1" />
                  شهري
                </TabsTrigger>
                <TabsTrigger value="annual">
                  <FileText className="h-4 w-4 mr-1" />
                  سنوي
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Date Picker */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={goToPreviousPeriod}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => handleDateChange(new Date(e.target.value))}
                  className="w-48"
                />
                <Button variant="outline" size="icon" onClick={goToNextPeriod}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={generatePDF}
                disabled={isGenerating || isLoading}
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'جاري الإنشاء...' : 'إنشاء تقرير PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {previewData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                معاينة التقرير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                <PreviewStat label={settings?.pdfLanguage === 'ar' ? 'أيام الحضور' : 'Present'} value={previewData.presentDays} icon={CheckCircle2} color="text-green-600" />
                <PreviewStat label={settings?.pdfLanguage === 'ar' ? 'أيام الغياب' : 'Absent'} value={previewData.absentDays} icon={XCircle} color="text-red-600" />
                <PreviewStat label={settings?.pdfLanguage === 'ar' ? 'أيام التأخير' : 'Late'} value={previewData.lateDays} icon={Clock} color="text-orange-600" />
                <PreviewStat label={settings?.pdfLanguage === 'ar' ? 'أيام الإجازات' : 'Leave'} value={previewData.leaveDays} icon={Calendar} color="text-blue-600" />
                <PreviewStat label={settings?.pdfLanguage === 'ar' ? 'ساعات العمل' : 'Work Hrs'} value={previewData.totalWorkHours.toFixed(1)} icon={TrendingUp} color="text-purple-600" />
                <PreviewStat label={settings?.pdfLanguage === 'ar' ? 'أوفر تايم' : 'Overtime'} value={previewData.totalOvertimeHours.toFixed(1)} icon={AlertCircle} color="text-red-600" />
                <PreviewStat label={settings?.pdfLanguage === 'ar' ? 'نسبة الحضور' : 'Rate %'} value={`${previewData.attendanceRate.toFixed(1)}%`} icon={TrendingUp} color="text-green-600" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الحضور ({attendanceRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لا توجد سجلات لهذه الفترة</div>
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
                        <TableCell>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                        <TableCell>{record.totalWorkHours.toFixed(2)}</TableCell>
                        <TableCell className={record.overtimeHours > 0 ? 'text-purple-600 font-medium' : ''}>{record.overtimeHours.toFixed(2)}</TableCell>
                        <TableCell className={record.lateMinutes > 0 ? 'text-orange-600 font-medium' : ''}>{record.lateMinutes > 0 ? `${record.lateMinutes} د` : '—'}</TableCell>
                        <TableCell className={record.earlyLeaveMinutes > 0 ? 'text-red-600 font-medium' : ''}>{record.earlyLeaveMinutes > 0 ? `${record.earlyLeaveMinutes} د` : '—'}</TableCell>
                        <TableCell><Badge className={getStatusColor(record.status)}>{getStatusLabel(record.status)}</Badge></TableCell>
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

function PreviewStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="p-4 border rounded-lg text-center">
      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center mx-auto mb-2', `${color} bg-opacity-10`)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

import { getDayName } from '@/lib/utils';