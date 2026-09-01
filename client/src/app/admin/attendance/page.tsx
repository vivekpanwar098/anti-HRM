"use client";
import { useState, useEffect, useRef } from "react";
import { getAttendanceOverview } from "@/features/admin/services/attendance.service";

import {
  Search,
  Sun,
  Users,
  UserX,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";

interface AttendanceRow {
  id: string | number;
  employee: string;
  role: string;
  department: string;
  date: string;
  status: string;
  statusBg: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
}

interface AttendanceStats {
  firstCheckIn?: string;
  present?: number;
  absent?: number;
  halfDay?: number;
  late?: number;
  onLeave?: number;
  attendancePercent?: number;
}

// 🔧 API record shape (from /admin/attendance/overview) — differs from
// what the table expects, so we map field-by-field in fetchData below.
interface ApiAttendanceRecord {
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

// 🔧 API response kabhi seedha payload bhejta hai, kabhi { data: payload }
// mein wrapped — dono shapes ko safely type karte hain, `any` ke bina.
interface AttendanceOverviewPayload {
  summary?: AttendanceStats;
  records?: ApiAttendanceRecord[];
  pagination?: unknown;
}

type AttendanceOverviewResponse =
  | AttendanceOverviewPayload
  | { data: AttendanceOverviewPayload };

// 🔧 Type guard — ternary + `in` se TS properly narrow nahi kar pa raha tha
// (false branch mein poora union reh jata tha), isliye explicit predicate.
const hasDataWrapper = (
  r: AttendanceOverviewResponse
): r is { data: AttendanceOverviewPayload } =>
  typeof r === "object" && r !== null && "data" in r && r.data !== undefined;

const toInputValue = (d: Date) => d.toISOString().slice(0, 10);
const toDisplay = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

//  LIVE CLOCK 
const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatLiveDate = (d: Date) => {
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  const year = d.getFullYear();
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

const formatLiveTime = (d: Date) =>
  d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });


// Half Day / Late / On Leave) — "statusBg" jaisi koi field nahi hoti.
// Table ko badge color chahiye, isliye status se compute karte hain.
const statusStyleMap: Record<string, string> = {
  present: "bg-blue-50 text-blue-600",
  absent: "bg-pink-50 text-pink-600",
  "half day": "bg-amber-50 text-amber-600",
  late: "bg-orange-50 text-orange-600",
  "on leave": "bg-purple-50 text-purple-600",
};

const getStatusBg = (status: string) =>
  statusStyleMap[status?.toLowerCase()?.trim()] ?? "bg-gray-50 text-gray-600";

// 🔁 Kitni der mein auto-refresh karna hai (ms). Zaroorat ho toh badal lena.
const POLL_INTERVAL_MS = 10000;

// 🔁 FIX: agar poll aur window-focus dono ek chhote se time window mein fire
// ho jaayein (jaise DevTools open/close karna, tab switch karna, StrictMode
// double-invoke), toh do overview requests almost saath mein chali jaati
// thi — Network tab mein duplicate "overview?date=..." entries dikhti thi.
// Ab har fetch attempt se pehle check karte hain ki last successful fetch
// ko kitna time hua — agar MIN_FETCH_GAP_MS se kam hai, toh skip kar dete hain.
const MIN_FETCH_GAP_MS = 3000;

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  real, interactive date 

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔁 FIX: pehle sirf `selectedDate` change hone par ek baar fetch hota tha,
  // isliye employee ke check-in/check-out karne ke baad admin ko manually
  // page refresh karna padta tha. Ab:
  //   1) selectedDate change hone par fresh load hota hai (spinner ke sath)
  //   2) har POLL_INTERVAL_MS par silently background mein re-fetch hota hai
  //   3) jab admin browser tab par wapas focus kare, turant re-fetch hota hai
  //   4) 🔧 NEW: ek in-flight guard + min-gap debounce, taaki poll + focus
  //      ek saath fire hone par duplicate requests na banein
  useEffect(() => {
    let isMounted = true;
    let isFetchInFlight = false;
    let lastFetchAt = 0;

    const fetchData = async (isInitialLoad = false) => {
      const nowTs = Date.now();

      // 🔧 Skip agar already ek request chal rahi hai, ya last fetch abhi
      // MIN_FETCH_GAP_MS se pehle hui thi (initial load isse exempt hai).
      if (isFetchInFlight) return;
      if (!isInitialLoad && nowTs - lastFetchAt < MIN_FETCH_GAP_MS) return;

      isFetchInFlight = true;
      lastFetchAt = nowTs;

      try {
        if (isInitialLoad) setLoading(true);
        setError(null);

        const res: AttendanceOverviewResponse = await getAttendanceOverview(
          toInputValue(selectedDate)
        );

        // 🔧 FIX: backend response ek extra "data" level mein wrapped hota
        // hai — { data: { summary, records, pagination } }. Type guard se
        // dono shapes handle karte hain, `any` use kiye bina.
        const payload: AttendanceOverviewPayload = hasDataWrapper(res)
          ? res.data
          : res;

        const records: ApiAttendanceRecord[] = payload?.records || [];

        // 🔧 FIX: API fields (employeeId, name) ko table ke expected
        // fields (id, employee) se map kiya, aur statusBg compute kiya.
        const mappedRows: AttendanceRow[] = records.map((r) => ({
          id: r.employeeId,
          employee: r.name,
          role: r.role,
          department: r.department,
          date: r.date,
          status: r.status,
          statusBg: getStatusBg(r.status),
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          workHours: r.workHours,
        }));

        if (!isMounted) return;
        setAttendanceData(mappedRows);
        setStats(payload?.summary || null);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching attendance:", err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        isFetchInFlight = false;
        if (isMounted && isInitialLoad) setLoading(false);
      }
    };

    // pehli / date-change wali load — spinner dikhega
    fetchData(true);

    // background polling — silent update, spinner nahi dikhega
    const pollId = setInterval(() => fetchData(false), POLL_INTERVAL_MS);

    // tab par wapas focus aane par turant refresh (debounce guard ki wajah
    // se agar poll abhi-abhi chal chuka hai toh yeh skip ho jaayega)
    const handleFocus = () => fetchData(false);
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    setSelectedDate(new Date(y, m - 1, d));
  };

  const isToday = toInputValue(selectedDate) === toInputValue(new Date());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading Attendance...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-500 font-medium">Failed to load: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)",
        }}
      >
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-sm text-white/90 mt-1">
          View and track your daily attendance and working hours.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Time Tracker */}
        {/* 🎨 Redesigned: dono blocks (time + date) ab ek hi tarah ke icon-badge
            row style mein hain, beech mein hairline divider — button hatne se jo
            khaali gap bana tha wo khatam, poora card evenly fill hota hai */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-[#18A096] rounded-full shrink-0">
              <Sun size={22} />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-800 tabular-nums">
                {formatLiveTime(now)}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                First Check - in {isToday ? "Today" : "on " + toDisplay(selectedDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-full shrink-0">
              <CalendarIcon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{isToday ? "Today" : "Viewing"}</p>
              <p className="text-sm font-bold text-gray-800">
                {isToday ? formatLiveDate(now) : toDisplay(selectedDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: 2x3 Sub-grid */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.present ?? 0}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Present</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-full">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.absent ?? 0}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Absent</p>
            </div>
            <div className="p-2 bg-pink-50 text-pink-500 rounded-full">
              <UserX size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.halfDay ?? 0}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Half Day</p>
            </div>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-full">
              <Clock size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.late ?? 0}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Late</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-full">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.onLeave ?? 0}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">On Leave</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-full">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">
                {stats?.attendancePercent ?? 0}%
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Attendance %</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-full">
              <Users size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Overview Table Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">Attendance Overview</h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Quick Search..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#18A096]"
              />
            </div>

            {/* ✅ real date picker now — click opens native calendar, selecting a
                date updates selectedDate, which re-fetches attendance for that day */}
            <div className="relative">
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
                className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                <CalendarIcon size={14} /> {toDisplay(selectedDate)}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={toInputValue(selectedDate)}
                onChange={handleDateChange}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>

            {/* <button className="flex items-center gap-1 bg-[#18A096] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#12544F]">
              <SlidersHorizontal size={14} /> View Attendance
            </button> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Employee</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Check-in</th>
                <th className="py-3 px-4 font-semibold">Check-out</th>
                <th className="py-3 px-4 font-semibold">Work hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendanceData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-medium text-gray-800">{row.id}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{row.employee}</td>
                  <td className="py-3 px-4 text-gray-500">{row.role}</td>
                  <td className="py-3 px-4 text-gray-500">{row.department}</td>
                  <td className="py-3 px-4 text-gray-500">{row.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${row.statusBg}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-blue-600">{row.checkIn}</td>
                  <td className="py-3 px-4 font-medium text-gray-500">{row.checkOut}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{row.workHours}</td>
                </tr>
              ))}

              {attendanceData.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-400">
                    No attendance records found for {toDisplay(selectedDate)}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}