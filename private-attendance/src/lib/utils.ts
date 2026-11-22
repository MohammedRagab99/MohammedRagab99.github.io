import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(date: Date | string, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatShortDate(date)} ${formatTime(date)}`;
}

export function formatHours(hours: number): string {
  return hours.toFixed(2);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}س ${m}د`;
  return `${m}د`;
}

export function getDayName(date: Date | string, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' });
}

export function getShortDayName(date: Date | string, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isWeekend(date: Date | string, weekendDay: 5 | 6 = 5): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  // For Egypt: Friday = 5, Saturday = 6 (in getDay: Friday=5, Saturday=6)
  return day === weekendDay || day === 6;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday first
  result.setDate(diff);
  return startOfDay(result);
}

export function endOfWeek(date: Date): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthName(month: number, locale: 'ar' | 'en' = 'ar'): string {
  const date = new Date(2000, month, 1);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' });
}

export function getYearMonthString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseYearMonth(str: string): Date {
  const [year, month] = str.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

export function calculateWorkHours(
  checkIn: Date | string,
  checkOut: Date | string,
  breakMinutes: number = 60
): number {
  const inTime = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const outTime = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const diffMs = outTime.getTime() - inTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return Math.max(0, (diffMinutes - breakMinutes) / 60);
}

export function calculateLateMinutes(
  checkIn: Date | string,
  workStartTime: string // HH:mm
): number {
  const inTime = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const [hours, minutes] = workStartTime.split(':').map(Number);
  const workStart = new Date(inTime);
  workStart.setHours(hours, minutes, 0, 0);

  if (inTime > workStart) {
    return Math.floor((inTime.getTime() - workStart.getTime()) / (1000 * 60));
  }
  return 0;
}

export function calculateEarlyLeaveMinutes(
  checkOut: Date | string,
  workEndTime: string // HH:mm
): number {
  const outTime = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const [hours, minutes] = workEndTime.split(':').map(Number);
  const workEnd = new Date(outTime);
  workEnd.setHours(hours, minutes, 0, 0);

  if (outTime < workEnd) {
    return Math.floor((workEnd.getTime() - outTime.getTime()) / (1000 * 60));
  }
  return 0;
}

export function getAttendanceStatus(
  checkIn: Date | string | null,
  checkOut: Date | string | null,
  workStartTime: string,
  workEndTime: string,
  isHoliday: boolean = false,
  isWeekend: boolean = false
): 'present' | 'incomplete' | 'absent' | 'late' | 'early_leave' | 'on_leave' | 'holiday' | 'weekend' {
  if (isHoliday) return 'holiday';
  if (isWeekend) return 'weekend';

  if (!checkIn && !checkOut) return 'absent';
  if (checkIn && !checkOut) return 'incomplete';
  if (!checkIn && checkOut) return 'incomplete';

  const lateMinutes = calculateLateMinutes(checkIn!, workStartTime);
  const earlyMinutes = calculateEarlyLeaveMinutes(checkOut!, workEndTime);

  if (lateMinutes > 0 && earlyMinutes > 0) return 'present';
  if (lateMinutes > 0) return 'late';
  if (earlyMinutes > 0) return 'early_leave';
  return 'present';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    incomplete: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    late: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    early_leave: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    on_leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    weekend: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string, locale: 'ar' | 'en' = 'ar'): string {
  const labels: Record<string, { ar: string; en: string }> = {
    present: { ar: 'حاضر', en: 'Present' },
    incomplete: { ar: 'ناقص', en: 'Incomplete' },
    absent: { ar: 'غائب', en: 'Absent' },
    late: { ar: 'متأخر', en: 'Late' },
    early_leave: { ar: 'انصراف مبكر', en: 'Early Leave' },
    on_leave: { ar: 'في إجازة', en: 'On Leave' },
    holiday: { ar: 'عطلة', en: 'Holiday' },
    weekend: { ar: 'عطلة أسبوعية', en: 'Weekend' },
    pending: { ar: 'معلقة', en: 'Pending' },
    approved: { ar: 'معتمدة', en: 'Approved' },
    rejected: { ar: 'مرفوضة', en: 'Rejected' },
    cancelled: { ar: 'ملغية', en: 'Cancelled' },
  };
  return labels[status]?.[locale] || status;
}

export function getLeaveTypeLabel(type: string, locale: 'ar' | 'en' = 'ar'): string {
  const types: Record<string, { ar: string; en: string }> = {
    annual: { ar: 'سنوية', en: 'Annual' },
    sick: { ar: 'مرضية', en: 'Sick' },
    casual: { ar: 'عرضية', en: 'Casual' },
    maternity: { ar: 'أمومة', en: 'Maternity' },
    paternity: { ar: 'أبوة', en: 'Paternity' },
    marriage: { ar: 'زواج', en: 'Marriage' },
    hajj: { ar: 'حج', en: 'Hajj' },
    study: { ar: 'دراسية', en: 'Study' },
    unpaid: { ar: 'بدون راتب', en: 'Unpaid' },
    compensatory: { ar: 'تعويضية', en: 'Compensatory' },
    other: { ar: 'أخرى', en: 'Other' },
  };
  return types[type]?.[locale] || type;
}

export function getOvertimeTypeLabel(type: string, locale: 'ar' | 'en' = 'ar'): string {
  const types: Record<string, { ar: string; en: string }> = {
    regular: { ar: 'عادي', en: 'Regular' },
    weekend: { ar: 'عطلة أسبوعية', en: 'Weekend' },
    holiday: { ar: 'عطلة رسمية', en: 'Holiday' },
    night_shift: { ar: 'وردية ليلية', en: 'Night Shift' },
    emergency: { ar: 'طوارئ', en: 'Emergency' },
  };
  return types[type]?.[locale] || type;
}