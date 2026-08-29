"use client";
import { useState, useEffect } from "react";
import { getAttendanceOverview } from "@/services/attendance.service";

import {
  Search,
  Sun,
  Users,
  UserX,
  Clock,
  Calendar as CalendarIcon,
  SlidersHorizontal,
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
  halfDay?: string | number;
  late?: string | number;
  onLeave?: string | number;
  attendancePercentage?: number;
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceOverview();

        setAttendanceData(data?.attendanceData || data?.records || []);
        setStats(data?.stats || data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {/* 🎨 Color updated: banner ab brand gradient (#18A096 → #12544F) use kar raha hai */}
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
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#18A096]">
              <Sun size={24} />
              <span className="text-xl font-bold text-gray-700">{stats?.firstCheckIn || "10:02:09 AM"}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">First Check - in Today</p>
          </div>
          <div className="mt-6">
            <p className="text-xs text-gray-500">Today:</p>
            <p className="text-sm font-bold text-gray-800">2nd August 2023</p>
            <button className="w-full mt-3 bg-[#18A096] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#12544F]">
              View Details
            </button>
          </div>
        </div>

        {/* Card 2: 2x3 Sub-grid */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.present ?? 452}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Present</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-full">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.absent ?? 45}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Absent</p>
            </div>
            <div className="p-2 bg-pink-50 text-pink-500 rounded-full">
              <UserX size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.halfDay ?? "04"}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Half Day</p>
            </div>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-full">
              <Clock size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.late ?? "01"}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Late</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-full">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.onLeave ?? "02"}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">On Leave</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-full">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{stats?.attendancePercentage ?? 20}%</h3>
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

            <button className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium">
              <CalendarIcon size={14} /> 29 July 2023
            </button>

            <button className="flex items-center gap-1 bg-[#18A096] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#12544F]">
              <SlidersHorizontal size={14} /> View Attendance
            </button>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}