"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";
import AttendanceCard from "./components/AttendanceCard";
import MonthlyAttendanceCard from "./components/MonthlyAttendanceCard";
import { getDashboardStats } from "@/features/admin/services/dashboard.service";

type DashboardStats = {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  attendancePercent: number;
  onLeave: number;
  newEmployees: number;
  monthlyAttendanceTrend?: { date: string; attendancePercent: number }[];
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatToday = (d: Date) =>
  `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;

const getGreeting = (d: Date) => {
  const hour = d.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  return "Good Night";
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !now) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-500 font-medium">Failed to load: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-[#18A096] to-[#12544F] rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md relative">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting(now)}, HR Admin</h1>
          <p className="text-sm text-white/80">
            Here&apos;s what&apos;s happening across your organization today.
          </p>
        </div>

        <div className="bg-white text-gray-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm">
          <Calendar size={16} className="text-[#18A096]" />
          <span>{formatToday(now)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total Employee</p>
            <h3 className="text-3xl font-extrabold text-gray-900 my-1">{stats?.totalEmployees}</h3>
            <span className="text-xs font-semibold text-[#18A096] flex items-center gap-1">
              <TrendingUp size={14} /> 8.5% Up from yesterday
            </span>
          </div>
          <div className="bg-[#EDE9FE] text-[#7C3AED] p-3 rounded-xl font-bold">👥</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Present Today</p>
            <h3 className="text-3xl font-extrabold text-gray-900 my-1">{stats?.presentToday}</h3>
          </div>
          <div className="bg-[#FEF3C7] text-[#D97706] p-3 rounded-xl font-bold">📦</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Absent Today</p>
            <h3 className="text-3xl font-extrabold text-gray-900 my-1">{stats?.absentToday}</h3>
          </div>
          <div className="bg-[#DCFCE7] text-[#15803D] p-3 rounded-xl font-bold">📈</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Attendance %</p>
            <h3 className="text-3xl font-extrabold text-gray-900 my-1">{stats?.attendancePercent}%</h3>
          </div>
          <div className="bg-[#DCFCE7] text-[#15803D] p-3 rounded-xl font-bold">📦</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">On Leave</p>
            <h3 className="text-3xl font-extrabold text-gray-900 my-1">{stats?.onLeave}</h3>
          </div>
          <div className="bg-[#DCFCE7] text-[#15803D] p-3 rounded-xl font-bold">⏳</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">New Employees</p>
            <h3 className="text-3xl font-extrabold text-gray-900 my-1">{stats?.newEmployees}</h3>
          </div>
          <div className="bg-[#DCFCE7] text-[#15803D] p-3 rounded-xl font-bold">👨‍💻</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <MonthlyAttendanceCard data={stats?.monthlyAttendanceTrend ?? []} />
        </div>
        <div className="lg:col-span-1">
          <AttendanceCard present={stats?.attendancePercent ?? 0} />
        </div>
      </div>
    </div>
  );
}