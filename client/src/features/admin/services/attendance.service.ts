import api from "@/lib/utils/axios";

// 🔧 Mirrors the shapes AttendancePage already expects/handles
// (see AttendanceOverviewPayload / AttendanceOverviewResponse there).
export interface ApiAttendanceRecord {
  employeeId: string;
  name: string;
  role: string;
  department: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
}

export interface AttendanceStats {
  firstCheckIn?: string;
  present?: number;
  absent?: number;
  halfDay?: number;
  late?: number;
  onLeave?: number;
  attendancePercent?: number;
}

export interface AttendanceOverviewPayload {
  summary?: AttendanceStats;
  records?: ApiAttendanceRecord[];
  pagination?: unknown;
}

export type AttendanceOverviewResponse =
  | AttendanceOverviewPayload
  | { data: AttendanceOverviewPayload };

/**
 * Fetches the admin attendance overview (summary stats + per-employee
 * records) for a given date. If no date is passed, the backend's default
 * (today) is used.
 *
 * NOTE: this intentionally returns `res.data` as-is (NOT `res.data.data`).
 * The backend sometimes wraps the payload in an extra `{ data: ... }`
 * envelope and sometimes doesn't — AttendancePage's `hasDataWrapper` type
 * guard already handles both shapes on the consuming side. Unwrapping here
 * too would double-unwrap the wrapped case and break it.
 */
export const getAttendanceOverview = async (
  date?: string
): Promise<AttendanceOverviewResponse> => {
  const res = await api.get<AttendanceOverviewResponse>(
    "admin/attendance/overview",
    {
      params: date ? { date } : {},
    }
  );

  return res.data;
};