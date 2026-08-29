"use client";

import { useState } from "react";
import { MoreHorizontal, Calendar, ChevronDown, GraduationCap } from "lucide-react";

const MONTHS = ["April 2026", "March 2026", "February 2026", "January 2026"];
const Employee = [" Employee ", " Marketing Employee  "];

type AttendanceCardProps = {
  present?: number;
};

export default function AttendanceCard({ present = 80 }: AttendanceCardProps) {
  const [month, setMonth] = useState(MONTHS[0]);
  const [monthOpen, setMonthOpen] = useState(false);

  const [employee, setEmployee] = useState(Employee[0]);
  const [classOpen, setClassOpen] = useState(false);

  // Smaller, fixed donut size so it never overflows
  const size = 170;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const presentLength = (present / 100) * circumference;
  const gap = 5;

  return (
    // FIX 1: 'overflow-hidden' ko hata kar 'overflow-visible' aur 'relative' kar diya hai
    <div className="w-full h-[420px] flex flex-col rounded-[28px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)] relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#4B5563]">Attendance</h3>
        <button className="text-[#4B5563] hover:text-gray-800" aria-label="More options">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#22C55E]" />
          <span className="text-sm text-[#6B7280]">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#DC2626]" />
          <span className="text-sm text-[#6B7280]">Absent</span>
        </div>
      </div>

      {/* Donut */}
      <div className="relative mx-auto mt-4 flex flex-1 items-center justify-center min-h-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#B91C1C"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#166534"
            strokeWidth={stroke}
            strokeDasharray={`${presentLength - gap} ${circumference - presentLength + gap}`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-medium text-[#111827]">{present}%</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-2 shrink-0">
        <div className="relative flex-1">
          <button
            onClick={() => {
              setMonthOpen((o) => !o);
              setClassOpen(false);
            }}
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-[#F3F4F6] px-3 py-2.5 text-[#6B7280] hover:bg-[#EAECEF]"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Calendar size={16} />
              <span className="text-sm truncate">{month}</span>
            </span>
            <ChevronDown size={16} className="shrink-0" />
          </button>

          {/* FIX 2: Dropdown ko card ke upar kholne ke liye 'bottom-full mb-2' aur 'z-50' set kiya hai */}
          {monthOpen && (
            <div className="absolute left-0 right-0 bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMonth(m);
                    setMonthOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                    m === month ? "font-semibold text-[#166534]" : "text-gray-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <button
            onClick={() => {
              setClassOpen((o) => !o);
              setMonthOpen(false);
            }}
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-[#F3F4F6] px-3 py-2.5 text-[#6B7280] hover:bg-[#EAECEF]"
          >
            <span className="flex items-center gap-1.5 truncate">
              <GraduationCap size={16} />
              <span className="text-sm truncate">{employee}</span>
            </span>
            <ChevronDown size={16} className="shrink-0" />
          </button>

          {/* FIX 3: Employee dropdown ke liye bhi 'bottom-full mb-2' aur 'z-50' set kiya hai */}
          {classOpen && (
            <div className="absolute left-0 right-0 bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl">
              {Employee.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setEmployee(c);
                    setClassOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                    c === employee ? "font-semibold text-[#166534]" : "text-gray-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}