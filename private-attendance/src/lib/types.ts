// Core Types matching the mobile app

export type AttendanceStatus =
  | 'present'
  | 'incomplete'
  | 'absent'
  | 'late'
  | 'early_leave'
  | 'on_leave'
  | 'holiday'
  | 'weekend';

export type LeaveType =
  | 'annual'
  | 'sick'
  | 'casual'
  | 'maternity'
  | 'paternity'
  | 'marriage'
  | 'hajj'
  | 'study'
  | 'unpaid'
  | 'compensatory'
  | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type OvertimeType =
  | 'regular'
  | 'weekend'
  | 'holiday'
  | 'night_shift'
  | 'emergency';

export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'compensated';

export type HolidayType = 'official' | 'religious' | 'national' | 'company' | 'other';

export interface BaseRecord {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  syncedToSheets?: boolean;
  sheetRowId?: string;
}

export interface AttendanceRecord extends BaseRecord {
  date: string; // YYYY-MM-DD
  checkInTime?: string; // ISO string
  checkOutTime?: string; // ISO string
  checkInLocation?: { lat: number; lng: number } | null;
  checkOutLocation?: { lat: number; lng: number } | null;
  totalWorkHours: number;
  overtimeHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveRecord extends BaseRecord {
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface OvertimeRecord extends BaseRecord {
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string
  endTime: string; // ISO string
  totalHours: number;
  overtimeType: OvertimeType;
  rateMultiplier: number;
  reason?: string;
  approvedBy?: string;
  status: OvertimeStatus;
  compensatoryLeaveGranted: boolean;
  compensatoryLeaveDays: number;
}

export interface Holiday extends BaseRecord {
  name: string;
  nameAr?: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD for multi-day
  type: HolidayType;
  isRecurring: boolean;
  description?: string;
  countryCode: string;
}

export interface UserSettings {
  id: string; // user ID
  // Basic Info
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  hireDate: string; // YYYY-MM-DD
  // Work Schedule
  workStartTime: string; // HH:mm
  workEndTime: string; // HH:mm
  breakDurationMinutes: number;
  weeklyWorkHours: number;
  workDaysPerWeek: number;
  weekendDay: 5 | 6; // Friday=5, Saturday=6
  // Overtime Settings
  overtimeRateNormal: number;
  overtimeRateWeekend: number;
  overtimeRateHoliday: number;
  maxOvertimeHoursPerMonth: number;
  // Leave Settings
  annualLeaveDays: number;
  sickLeaveDays: number;
  casualLeaveDays: number;
  marriageLeaveDays: number;
  hajjLeaveDays: number;
  maternityLeaveDays: number;
  paternityLeaveDays: number;
  // Notifications
  checkInReminderEnabled: boolean;
  checkInReminderTime: string; // HH:mm
  checkOutReminderEnabled: boolean;
  checkOutReminderTime: string; // HH:mm
  overtimeAlertEnabled: boolean;
  leaveBalanceAlertEnabled: boolean;
  // Google Sheets
  googleSheetsEnabled: boolean;
  googleSheetsSpreadsheetId: string;
  googleSheetsAutoSync: boolean;
  googleSheetsSyncFrequencyHours: number;
  lastSyncedAt?: string;
  // Security
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pinHash: string;
  // PDF
  pdfExportPath: string;
  pdfIncludeLocation: boolean;
  pdfLanguage: 'ar' | 'en';
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  year: number;
  totalEntitled: number;
  usedDays: number;
  carriedForward: number;
  updatedAt: Date | string;
}

export interface WeeklyStats {
  week: number;
  totalHours: number;
  daysWorked: number;
}

export interface MonthlyStats {
  month: number;
  totalHours: number;
  totalOvertime: number;
  daysWorked: number;
}

export interface OvertimeMonthlyStats {
  month: number;
  totalHours: number;
  calculatedHours: number;
  recordsCount: number;
}

export interface LeaveYearSummary {
  year: number;
  totalEntitled: number;
  totalUsed: number;
  totalRemaining: number;
  byType: Record<string, LeaveTypeSummary>;
}

export interface LeaveTypeSummary {
  type: LeaveType;
  entitled: number;
  used: number;
  remaining: number;
}

export interface DashboardState {
  todayRecord: AttendanceRecord | null;
  settings: UserSettings | null;
  todayLeaves: LeaveRecord[];
  monthOvertime: OvertimeRecord[];
}

export interface ReportPreview {
  totalWorkHours: number;
  totalOvertimeHours: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendanceRate: number;
}

export type ReportType = 'weekly' | 'monthly' | 'annual';

// Form types
export interface CheckInFormData {
  lat?: number;
  lng?: number;
}

export interface CheckOutFormData {
  lat?: number;
  lng?: number;
}

export interface LeaveRequestFormData {
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface OvertimeRequestFormData {
  date: Date;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  overtimeType: OvertimeType;
  reason: string;
}

export interface HolidayFormData {
  name: string;
  nameAr: string;
  date: Date;
  endDate?: Date;
  type: HolidayType;
  isRecurring: boolean;
  description?: string;
}

export interface SettingsFormData {
  employeeName: string;
  employeeId: string;
  department: string;
  position: string;
  hireDate: Date;
  workStartTime: string;
  workEndTime: string;
  breakDurationMinutes: number;
  weeklyWorkHours: number;
  workDaysPerWeek: number;
  weekendDay: 5 | 6;
  overtimeRateNormal: number;
  overtimeRateWeekend: number;
  overtimeRateHoliday: number;
  maxOvertimeHoursPerMonth: number;
  checkInReminderEnabled: boolean;
  checkInReminderTime: string;
  checkOutReminderEnabled: boolean;
  checkOutReminderTime: string;
  overtimeAlertEnabled: boolean;
  leaveBalanceAlertEnabled: boolean;
  googleSheetsEnabled: boolean;
  googleSheetsSpreadsheetId: string;
  googleSheetsAutoSync: boolean;
  googleSheetsSyncFrequencyHours: number;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pdfExportPath: string;
  pdfIncludeLocation: boolean;
  pdfLanguage: 'ar' | 'en';
}

// Default values
export const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  employeeName: '',
  employeeId: '',
  department: '',
  position: '',
  hireDate: new Date().toISOString().split('T')[0],
  workStartTime: '09:00',
  workEndTime: '17:00',
  breakDurationMinutes: 60,
  weeklyWorkHours: 48,
  workDaysPerWeek: 6,
  weekendDay: 5,
  overtimeRateNormal: 1.5,
  overtimeRateWeekend: 1.5,
  overtimeRateHoliday: 2.0,
  maxOvertimeHoursPerMonth: 60,
  annualLeaveDays: 21,
  sickLeaveDays: 180,
  casualLeaveDays: 6,
  marriageLeaveDays: 7,
  hajjLeaveDays: 30,
  maternityLeaveDays: 90,
  paternityLeaveDays: 3,
  checkInReminderEnabled: true,
  checkInReminderTime: '08:45',
  checkOutReminderEnabled: true,
  checkOutReminderTime: '16:45',
  overtimeAlertEnabled: true,
  leaveBalanceAlertEnabled: true,
  googleSheetsEnabled: false,
  googleSheetsSpreadsheetId: '',
  googleSheetsAutoSync: false,
  googleSheetsSyncFrequencyHours: 24,
  biometricEnabled: false,
  pinEnabled: false,
  pinHash: '',
  pdfExportPath: '',
  pdfIncludeLocation: false,
  pdfLanguage: 'ar',
};

export const EGYPT_FIXED_HOLIDAYS = [
  { month: 1, day: 7, name: 'عيد الميلاد المجيد', nameAr: 'عيد الميلاد المجيد', type: 'religious' as HolidayType },
  { month: 1, day: 25, name: 'ثورة 25 يناير', nameAr: 'ثورة 25 يناير', type: 'national' as HolidayType },
  { month: 1, day: 25, name: 'عيد الشرطة', nameAr: 'عيد الشرطة', type: 'national' as HolidayType },
  { month: 5, day: 1, name: 'عيد العمال', nameAr: 'عيد العمال', type: 'official' as HolidayType },
  { month: 6, day: 30, name: 'ثورة 30 يونيو', nameAr: 'ثورة 30 يونيو', type: 'national' as HolidayType },
  { month: 7, day: 23, name: 'ثورة 23 يوليو', nameAr: 'ثورة 23 يوليو', type: 'national' as HolidayType },
  { month: 10, day: 6, name: 'عيد النصر / العيد الوطني', nameAr: 'العيد الوطني', type: 'national' as HolidayType },
] as const;