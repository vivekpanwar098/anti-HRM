"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TrendData = {
  month: string;
  tasks: number;
  secondary: number;
};

const data: TrendData[] = [
  { month: "Jan", tasks: 20, secondary: 15 },
  { month: "Feb", tasks: 55, secondary: 60 },
  { month: "Mar", tasks: 40, secondary: 25 },
  { month: "Apr", tasks: 62, secondary: 55 },
  { month: "May", tasks: 72, secondary: 40 },
  { month: "Jun", tasks: 58, secondary: 70 },
  { month: "Jul", tasks: 65, secondary: 50 },
];

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-100">
        {payload[0].value} task
      </div>
    );
  }
  return null;
}

export default function MonthlyAttendanceTrend() {
  return (
    <div className="w-full h-[420px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-base font-semibold text-slate-600">
          Monthly Attendance Trend
        </h2>
        <select className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-500 outline-none">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-2 shrink-0">Tasks</p>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18A096" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#18A096" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
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

            <Line
              type="monotone"
              dataKey="secondary"
              stroke="#D1D5DB"
              strokeWidth={2}
              dot={false}
            />

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
      </div>
    </div>
  );
}