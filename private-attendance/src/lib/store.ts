import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserSettings,
  AttendanceRecord,
  LeaveRecord,
  OvertimeRecord,
  Holiday,
  LeaveBalance,
  DashboardState,
  ReportType,
  ReportPreview,
} from './types';

interface AppState {
  // Auth
  user: { uid: string; email: string; displayName?: string } | null;
  isAuthenticated: boolean;
  setUser: (user: AppState['user']) => void;
  logout: () => void;

  // Settings
  settings: UserSettings | null;
  setSettings: (settings: UserSettings) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;

  // Dashboard
  dashboard: DashboardState | null;
  setDashboard: (dashboard: DashboardState) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (record: AttendanceRecord) => void;

  // Leaves
  leaveRecords: LeaveRecord[];
  leaveBalances: LeaveBalance[];
  setLeaveRecords: (records: LeaveRecord[]) => void;
  setLeaveBalances: (balances: LeaveBalance[]) => void;
  addLeaveRecord: (record: LeaveRecord) => void;
  updateLeaveRecord: (record: LeaveRecord) => void;

  // Overtime
  overtimeRecords: OvertimeRecord[];
  setOvertimeRecords: (records: OvertimeRecord[]) => void;
  addOvertimeRecord: (record: OvertimeRecord) => void;
  updateOvertimeRecord: (record: OvertimeRecord) => void;

  // Holidays
  holidays: Holiday[];
  setHolidays: (holidays: Holiday[]) => void;
  addHoliday: (holiday: Holiday) => void;

  // Reports
  reportType: ReportType;
  setReportType: (type: ReportType) => void;
  reportPreview: ReportPreview | null;
  setReportPreview: (preview: ReportPreview | null) => void;

  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Current view date
  currentDate: Date;
  setCurrentDate: (date: Date) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Notifications
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({
        user: null,
        isAuthenticated: false,
        settings: null,
        dashboard: null,
        attendanceRecords: [],
        leaveRecords: [],
        leaveBalances: [],
        overtimeRecords: [],
        holidays: [],
        reportPreview: null,
      }),

      // Settings
      settings: null,
      setSettings: (settings) => set({ settings }),
      updateSettings: (partial) =>
        set((state) => ({
          settings: state.settings ? { ...state.settings, ...partial } : null,
        })),

      // Dashboard
      dashboard: null,
      setDashboard: (dashboard) => set({ dashboard }),

      // Attendance
      attendanceRecords: [],
      setAttendanceRecords: (attendanceRecords) => set({ attendanceRecords }),
      addAttendanceRecord: (record) =>
        set((state) => ({
          attendanceRecords: [record, ...state.attendanceRecords.filter((r) => r.id !== record.id)],
        })),
      updateAttendanceRecord: (record) =>
        set((state) => ({
          attendanceRecords: state.attendanceRecords.map((r) => (r.id === record.id ? record : r)),
        })),

      // Leaves
      leaveRecords: [],
      leaveBalances: [],
      setLeaveRecords: (leaveRecords) => set({ leaveRecords }),
      setLeaveBalances: (leaveBalances) => set({ leaveBalances }),
      addLeaveRecord: (record) =>
        set((state) => ({
          leaveRecords: [record, ...state.leaveRecords.filter((r) => r.id !== record.id)],
        })),
      updateLeaveRecord: (record) =>
        set((state) => ({
          leaveRecords: state.leaveRecords.map((r) => (r.id === record.id ? record : r)),
        })),

      // Overtime
      overtimeRecords: [],
      setOvertimeRecords: (overtimeRecords) => set({ overtimeRecords }),
      addOvertimeRecord: (record) =>
        set((state) => ({
          overtimeRecords: [record, ...state.overtimeRecords.filter((r) => r.id !== record.id)],
        })),
      updateOvertimeRecord: (record) =>
        set((state) => ({
          overtimeRecords: state.overtimeRecords.map((r) => (r.id === record.id ? record : r)),
        })),

      // Holidays
      holidays: [],
      setHolidays: (holidays) => set({ holidays }),
      addHoliday: (holiday) =>
        set((state) => ({
          holidays: [...state.holidays.filter((h) => h.id !== holiday.id), holiday],
        })),

      // Reports
      reportType: 'monthly',
      setReportType: (reportType) => set({ reportType }),
      reportPreview: null,
      setReportPreview: (reportPreview) => set({ reportPreview }),

      // UI State
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // Current view date
      currentDate: new Date(),
      setCurrentDate: (currentDate) => set({ currentDate }),

      // Loading states
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: crypto.randomUUID() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'attendance-app-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        sidebarOpen: state.sidebarOpen,
        reportType: state.reportType,
      }),
    }
  )
);

// Selectors for performance
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useSettings = () => useAppStore((state) => state.settings);
export const useDashboard = () => useAppStore((state) => state.dashboard);
export const useAttendanceRecords = () => useAppStore((state) => state.attendanceRecords);
export const useLeaveRecords = () => useAppStore((state) => state.leaveRecords);
export const useLeaveBalances = () => useAppStore((state) => state.leaveBalances);
export const useOvertimeRecords = () => useAppStore((state) => state.overtimeRecords);
export const useHolidays = () => useAppStore((state) => state.holidays);
export const useReportType = () => useAppStore((state) => state.reportType);
export const useReportPreview = () => useAppStore((state) => state.reportPreview);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useCurrentDate = () => useAppStore((state) => state.currentDate);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useNotifications = () => useAppStore((state) => state.notifications);
