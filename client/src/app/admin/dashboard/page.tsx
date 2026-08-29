"use client";

import { useEffect, useState, useRef } from "react";
import { 
  TrendingUp, 
  Calendar, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import AttendanceCard from "./components/AttendanceCard";
import MonthlyAttendanceCard from "./components/MonthlyAttendanceCard";
// Fixed import path to match your folder structure
import { getDashboardStats } from "@/services/dashboard.service";

type DashboardStats = {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  attendancePercent: number;
  onLeave: number;
  newEmployees: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar Dropdown States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 27)); 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 27));
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
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

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formattedDisplayDate = `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Banner with Calendar Dropdown */}
      <div className="bg-gradient-to-r from-[#18A096] to-[#12544F] rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md relative">
        <div>
          <h1 className="text-2xl font-bold">Good Morning, HR Admin</h1>
          <p className="text-sm text-white/80">
            Here&apos;s what&apos;s happening across your organization today.
          </p>
        </div>

        {/* Interactive Calendar Dropdown Button */}
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="bg-white text-gray-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Calendar size={16} className="text-[#18A096]" />
            <span>{formattedDisplayDate}</span>
          </button>

          {/* Calendar Popup Box */}
          {isCalendarOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 text-gray-800 z-50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{monthNames[month]}</span>
                  <span className="text-2xl font-bold text-gray-900">{year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center text-xs text-gray-400 font-semibold mb-2">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => {
                    const dayNum = daysInPrevMonth - firstDayOfMonth + index + 1;
                   return (
                <div key={`prev-${index}`} className="py-2 text-sm text-gray-300 font-medium">
                    {dayNum}
                   </div>
                 );
                })}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const dayNum = index + 1;
                  const isSelected =
                    selectedDate.getDate() === dayNum &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getFullYear() === year;

                  return (
                    <button
                      key={`curr-${dayNum}`}
                      onClick={() => {
                        setSelectedDate(new Date(year, month, dayNum));
                        setIsCalendarOpen(false);
                      }}
                      className={`py-2 text-sm font-medium rounded-xl transition-all ${
                        isSelected
                          ? "bg-[#18A096] text-white shadow-md"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
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

      {/* Attendance Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <MonthlyAttendanceCard />
        </div>
        <div className="lg:col-span-1">
          <AttendanceCard />
        </div>
      </div>
    </div>
  );
}