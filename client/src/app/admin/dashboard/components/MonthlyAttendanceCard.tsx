"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TrendPoint = {
  date: string;
  attendancePercent: number;
};

type ChartRow = {
  label: string;
  tasks: number;
};

type MonthlyAttendanceTrendProps = {
  data: TrendPoint[];
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-100">
        {payload[0].value}%
      </div>
    );
  }
  return null;
}

export default function MonthlyAttendanceTrend({ data }: MonthlyAttendanceTrendProps) {
  // ✅ map real API shape { date, attendancePercent } -> chart shape { label, tasks }
  const chartData: ChartRow[] = (data ?? []).map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    tasks: d.attendancePercent,
  }));

  const hasData = chartData.length > 0;

  return (
    <div className="w-full h-105 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-base font-semibold text-slate-600">
          Monthly Attendance Trend
        </h2>
        <select className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-500 outline-none">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-2 shrink-0">Attendance %</p>

      <div className="flex-1 min-h-0">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No attendance data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18A096" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#18A096" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="tasks"
                stroke="#18A096"
                strokeWidth={2.5}
                fill="url(#tealFill)"
                dot={{ r: 3, stroke: "#18A096", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}