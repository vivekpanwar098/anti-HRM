import api from "@/lib/utils/axios";

export const getDashboardStats = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data.data;

};

export const getAttendanceTrend = async (range: "weekly" | "monthly" = "weekly") => {
  const res = await api.get("/admin/dashboard", { params: { range } });
  return res.data;
  // expected shape: [{ month, tasks, secondary }, ...]
};

export const getAttendanceSummary = async (month: string) => {
  const res = await api.get("/admin/dashboard", { params: { month } });
  return res.data;
  // expected shape: { present: number } (0-100)
};