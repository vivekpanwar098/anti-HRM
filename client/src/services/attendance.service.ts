import api from "@/lib/utils/axios";

export const getAttendanceOverview = async (date?: string) => {
  const res = await api.get("admin/attendance/overview", {
    params: date ? { date } : {},
  });
  return res.data.data;
  // expected shape se pata chalega ke ismein list bhi hai aur stats bhi,
  // ya sirf ek. Backend response ka structure confirm kar ke bata dena,
  // us hisaab se page.tsx mein mapping thik kar dunga.
};