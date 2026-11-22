import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  QueryConstraint,
  DocumentSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, getUserCollection, getUserDoc } from './firebase';
import type {
  AttendanceRecord,
  LeaveRecord,
  OvertimeRecord,
  Holiday,
  UserSettings,
  LeaveBalance,
  LeaveType,
} from './types';
import { DEFAULT_SETTINGS, EGYPT_FIXED_HOLIDAYS } from './types';

// Generic CRUD operations
export async function createDoc<T extends { id: string }>(
  userId: string,
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> {
  const id = data.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const docRef = doc(db, getUserCollection(userId, collectionName), id);
  await setDoc(docRef, {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateDocById<T>(
  userId: string,
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, getUserCollection(userId, collectionName), id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteDocById(
  userId: string,
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, getUserCollection(userId, collectionName), id);
  await deleteDoc(docRef);
}

export async function getDocById<T>(
  userId: string,
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, getUserCollection(userId, collectionName), id);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as T) : null;
}

export async function getCollection<T>(
  userId: string,
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const colRef = collection(db, getUserCollection(userId, collectionName));
  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as T);
}

// User Settings
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserSettings;
}

export async function createUserSettings(userId: string, data: Partial<UserSettings> = {}): Promise<UserSettings> {
  const now = new Date().toISOString();
  const settings: UserSettings = {
    id: userId,
    ...DEFAULT_SETTINGS,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, COLLECTIONS.USERS, userId), settings);
  return settings;
}

export async function updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// Attendance
export async function getAttendanceRecord(userId: string, date: string): Promise<AttendanceRecord | null> {
  return getDocById<AttendanceRecord>(userId, COLLECTIONS.ATTENDANCE, date);
}

export async function getAttendanceRecords(
  userId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  return getCollection<AttendanceRecord>(userId, COLLECTIONS.ATTENDANCE, [
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc'),
  ]);
}

export async function getMonthlyAttendance(userId: string, yearMonth: string): Promise<AttendanceRecord[]> {
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;
  return getAttendanceRecords(userId, start, end);
}

export async function checkIn(
  userId: string,
  date: string,
  checkInTime: string,
  location?: { lat: number; lng: number },
  settings?: UserSettings
): Promise<AttendanceRecord> {
  const existing = await getAttendanceRecord(userId, date);
  const workStart = settings?.workStartTime || '09:00';
  const lateMinutes = calculateLateMinutes(checkInTime, workStart);

  const status = lateMinutes > 0 ? 'late' : 'incomplete';

  const record: AttendanceRecord = {
    id: date,
    date,
    checkInTime,
    checkInLocation: location || null,
    lateMinutes,
    status,
    totalWorkHours: 0,
    overtimeHours: 0,
    earlyLeaveMinutes: 0,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, getUserCollection(userId, COLLECTIONS.ATTENDANCE), date), record);
  return record;
}

export async function checkOut(
  userId: string,
  date: string,
  checkOutTime: string,
  location?: { lat: number; lng: number },
  settings?: UserSettings
): Promise<AttendanceRecord> {
  const existing = await getAttendanceRecord(userId, date);
  if (!existing) throw new Error('No check-in record found');
  if (existing.checkOutTime) throw new Error('Already checked out');

  const workEnd = settings?.workEndTime || '17:00';
  const breakMinutes = settings?.breakDurationMinutes || 60;
  const earlyMinutes = calculateEarlyLeaveMinutes(checkOutTime, workEnd);

  const checkInTime = existing.checkInTime!;
  const workMinutes = calculateWorkHours(checkInTime, checkOutTime, breakMinutes);
  const workHours = workMinutes;
  const standardHours = (settings?.weeklyWorkHours || 48) / (settings?.workDaysPerWeek || 6);
  const overtimeHours = Math.max(0, workHours - standardHours);

  let status: AttendanceRecord['status'] = 'present';
  if (existing.lateMinutes > 0 && earlyMinutes > 0) status = 'present';
  else if (existing.lateMinutes > 0) status = 'late';
  else if (earlyMinutes > 0) status = 'early_leave';

  const record: AttendanceRecord = {
    ...existing,
    checkOutTime,
    checkOutLocation: location || null,
    totalWorkHours: workHours,
    overtimeHours,
    earlyLeaveMinutes: earlyMinutes,
    status,
    updatedAt: new Date().toISOString(),
  };

  await updateDocById(userId, COLLECTIONS.ATTENDANCE, date, record);
  return record;
}

// Leave
export async function createLeaveRequest(
  userId: string,
  data: Omit<LeaveRecord, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'syncedToSheets'> & { status?: LeaveRecord['status'] }
): Promise<string> {
  return createDoc<LeaveRecord>(userId, COLLECTIONS.LEAVES, {
    ...data,
    status: data.status || 'pending',
    syncedToSheets: false,
  });
}

export async function getLeaveRecords(userId: string, year: number): Promise<LeaveRecord[]> {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return getCollection<LeaveRecord>(userId, COLLECTIONS.LEAVES, [
    where('startDate', '>=', start),
    where('startDate', '<=', end),
    orderBy('startDate', 'desc'),
  ]);
}

export async function getPendingLeaves(userId: string): Promise<LeaveRecord[]> {
  return getCollection<LeaveRecord>(userId, COLLECTIONS.LEAVES, [
    where('status', '==', 'pending'),
    orderBy('startDate', 'asc'),
  ]);
}

export async function approveLeave(
  userId: string,
  leaveId: string,
  approvedBy: string
): Promise<void> {
  await updateDocById(userId, COLLECTIONS.LEAVES, leaveId, {
    status: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
  });
  // Deduct from balance
  await deductLeaveBalance(userId, leaveId);
}

export async function rejectLeave(
  userId: string,
  leaveId: string,
  rejectionReason: string
): Promise<void> {
  await updateDocById(userId, COLLECTIONS.LEAVES, leaveId, {
    status: 'rejected',
    rejectionReason,
  });
}

export async function cancelLeave(userId: string, leaveId: string): Promise<void> {
  const leave = await getDocById<LeaveRecord>(userId, COLLECTIONS.LEAVES, leaveId);
  if (leave?.status === 'approved') {
    await addLeaveBalance(userId, leave.leaveType, leave.totalDays);
  }
  await updateDocById(userId, COLLECTIONS.LEAVES, leaveId, {
    status: 'cancelled',
  });
}

// Leave Balance
export async function getLeaveBalances(userId: string, year: number): Promise<LeaveBalance[]> {
  return getCollection<LeaveBalance>(userId, COLLECTIONS.LEAVE_BALANCES, [
    where('year', '==', year),
  ]);
}

export async function initializeLeaveBalances(userId: string, year: number, settings: UserSettings): Promise<void> {
  const leaveTypes: LeaveType[] = ['annual', 'sick', 'casual', 'maternity', 'paternity', 'marriage', 'hajj', 'study', 'unpaid', 'compensatory', 'other'];

  const now = new Date().toISOString();

  const refs = leaveTypes.map((type) => doc(db, getUserCollection(userId, COLLECTIONS.LEAVE_BALANCES), `${type}-${year}`));
  await runTransaction(db, async (transaction) => {
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    for (const [index, type] of leaveTypes.entries()) {
      if (snapshots[index].exists()) continue;
      let entitled = 0;

      switch (type) {
        case 'annual':
          entitled = settings.annualLeaveDays;
          break;
        case 'sick':
          entitled = settings.sickLeaveDays;
          break;
        case 'casual':
          entitled = settings.casualLeaveDays;
          break;
        case 'maternity':
          entitled = settings.maternityLeaveDays;
          break;
        case 'paternity':
          entitled = settings.paternityLeaveDays;
          break;
        case 'marriage':
          entitled = settings.marriageLeaveDays;
          break;
        case 'hajj':
          entitled = settings.hajjLeaveDays;
          break;
      }

      transaction.set(refs[index], {
        leaveType: type,
        year,
        totalEntitled: entitled,
        usedDays: 0,
        carriedForward: 0,
        updatedAt: now,
      });
    }
  });
}

async function deductLeaveBalance(userId: string, leaveId: string): Promise<void> {
  const leave = await getDocById<LeaveRecord>(userId, COLLECTIONS.LEAVES, leaveId);
  if (!leave) return;

  const balanceRef = doc(db, getUserCollection(userId, COLLECTIONS.LEAVE_BALANCES), `${leave.leaveType}-${leave.startDate.split('-')[0]}`);
  await runTransaction(db, async (transaction) => {
    const balanceSnap = await transaction.get(balanceRef);
    if (balanceSnap.exists()) {
      const balance = balanceSnap.data() as LeaveBalance;
      transaction.update(balanceRef, {
        usedDays: balance.usedDays + leave.totalDays,
        updatedAt: new Date().toISOString(),
      });
    }
  });
}

async function addLeaveBalance(userId: string, leaveType: LeaveType, days: number): Promise<void> {
  const year = new Date().getFullYear();
  const balanceRef = doc(db, getUserCollection(userId, COLLECTIONS.LEAVE_BALANCES), `${leaveType}-${year}`);
  await runTransaction(db, async (transaction) => {
    const balanceSnap = await transaction.get(balanceRef);
    if (balanceSnap.exists()) {
      const balance = balanceSnap.data() as LeaveBalance;
      transaction.update(balanceRef, {
        usedDays: Math.max(0, balance.usedDays - days),
        updatedAt: new Date().toISOString(),
      });
    }
  });
}

// Overtime
export async function createOvertimeRequest(
  userId: string,
  data: Omit<OvertimeRecord, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'syncedToSheets'> & { status?: OvertimeRecord['status'] }
): Promise<string> {
  return createDoc<OvertimeRecord>(userId, COLLECTIONS.OVERTIME, {
    ...data,
    status: data.status || 'pending',
    syncedToSheets: false,
  });
}

export async function getOvertimeRecords(userId: string, yearMonth: string): Promise<OvertimeRecord[]> {
  const start = `${yearMonth}-01`;
  const end = `${yearMonth}-31`;
  return getCollection<OvertimeRecord>(userId, COLLECTIONS.OVERTIME, [
    where('date', '>=', start),
    where('date', '<=', end),
    orderBy('date', 'desc'),
  ]);
}

export async function approveOvertime(
  userId: string,
  overtimeId: string,
  approvedBy: string,
  grantCompensatoryLeave: boolean = false
): Promise<void> {
  const overtime = await getDocById<OvertimeRecord>(userId, COLLECTIONS.OVERTIME, overtimeId);
  if (!overtime) return;

  let compensatoryDays = 0;
  if (grantCompensatoryLeave) {
    compensatoryDays = overtime.totalHours / 8;
  }

  await updateDocById(userId, COLLECTIONS.OVERTIME, overtimeId, {
    status: 'approved',
    approvedBy,
    compensatoryLeaveGranted: grantCompensatoryLeave,
    compensatoryLeaveDays: compensatoryDays,
  });

  if (grantCompensatoryLeave && compensatoryDays > 0) {
    // Add compensatory leave balance
    const balanceRef = doc(db, getUserCollection(userId, COLLECTIONS.LEAVE_BALANCES), `compensatory-${new Date().getFullYear()}`);
    await runTransaction(db, async (transaction) => {
      const balanceSnap = await transaction.get(balanceRef);
      if (balanceSnap.exists()) {
        const balance = balanceSnap.data() as LeaveBalance;
        transaction.update(balanceRef, {
          totalEntitled: balance.totalEntitled + compensatoryDays,
          updatedAt: new Date().toISOString(),
        });
      } else {
        transaction.set(balanceRef, {
          leaveType: 'compensatory',
          year: new Date().getFullYear(),
          totalEntitled: compensatoryDays,
          usedDays: 0,
          carriedForward: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }
}

export async function rejectOvertime(userId: string, overtimeId: string): Promise<void> {
  await updateDocById(userId, COLLECTIONS.OVERTIME, overtimeId, {
    status: 'rejected',
  });
}

// Holidays
export async function getHolidays(userId: string, year: number): Promise<Holiday[]> {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return getCollection<Holiday>(userId, COLLECTIONS.HOLIDAYS, [
    where('date', '>=', start),
    where('date', '<=', end),
    orderBy('date', 'asc'),
  ]);
}

export async function isHoliday(userId: string, date: string): Promise<Holiday | null> {
  const holidays = await getCollection<Holiday>(userId, COLLECTIONS.HOLIDAYS, [
    where('date', '<=', date),
    where('endDate', '>=', date),
    limit(1),
  ]);
  return holidays[0] || null;
}

export async function initializeHolidays(userId: string, year: number): Promise<void> {
  const existing = await getHolidays(userId, year);
  if (existing.length > 0) return;

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  for (const h of EGYPT_FIXED_HOLIDAYS) {
    try {
      const date = new Date(year, h.month - 1, h.day);
      const dateStr = date.toISOString().split('T')[0];
      const docRef = doc(db, getUserCollection(userId, COLLECTIONS.HOLIDAYS), `${dateStr}-${h.name}`);
      batch.set(docRef, {
        name: h.name,
        nameAr: h.nameAr,
        date: dateStr,
        type: h.type,
        isRecurring: true,
        countryCode: 'EG',
        createdAt: now,
        updatedAt: now,
      });
    } catch (e) {
      // Invalid date (e.g., Feb 29 on non-leap year)
    }
  }

  await batch.commit();
}

export async function addCustomHoliday(
  userId: string,
  data: Omit<Holiday, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheets'> & { id?: string }
): Promise<string> {
  return createDoc(userId, COLLECTIONS.HOLIDAYS, data);
}

// Helper functions
function calculateWorkHours(checkIn: string, checkOut: string, breakMinutes: number): number {
  const inTime = new Date(checkIn);
  const outTime = new Date(checkOut);
  const diffMs = outTime.getTime() - inTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return Math.max(0, (diffMinutes - breakMinutes) / 60);
}

function calculateLateMinutes(checkIn: string, workStart: string): number {
  const inTime = new Date(checkIn);
  const [hours, minutes] = workStart.split(':').map(Number);
  const workStartTime = new Date(inTime);
  workStartTime.setHours(hours, minutes, 0, 0);

  if (inTime > workStartTime) {
    return Math.floor((inTime.getTime() - workStartTime.getTime()) / (1000 * 60));
  }
  return 0;
}

function calculateEarlyLeaveMinutes(checkOut: string, workEnd: string): number {
  const outTime = new Date(checkOut);
  const [hours, minutes] = workEnd.split(':').map(Number);
  const workEndTime = new Date(outTime);
  workEndTime.setHours(hours, minutes, 0, 0);

  if (outTime < workEndTime) {
    return Math.floor((workEndTime.getTime() - outTime.getTime()) / (1000 * 60));
  }
  return 0;
}

// Statistics
export async function getAttendanceStats(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{
  present: number;
  absent: number;
  late: number;
  earlyLeave: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
}> {
  const records = await getAttendanceRecords(userId, startDate, endDate);

  return records.reduce(
    (acc, r) => {
      if (r.status === 'present') acc.present++;
      else if (r.status === 'absent') acc.absent++;
      else if (r.status === 'late') acc.late++;
      else if (r.status === 'early_leave') acc.earlyLeave++;

      acc.totalWorkHours += r.totalWorkHours;
      acc.totalOvertimeHours += r.overtimeHours;
      return acc;
    },
    { present: 0, absent: 0, late: 0, earlyLeave: 0, totalWorkHours: 0, totalOvertimeHours: 0 }
  );
}