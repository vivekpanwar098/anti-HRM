import api from "@/lib/utils/axios";

// ⚠️ assumption: "recentActivity" came back as an empty array in the sample response,
// so the item shape below is inferred from the existing dummy Report UI, not confirmed
// from a real populated response. Confirm keys (especially id / download url) once
// there's at least one real report to inspect.

export interface ReportSummary {
  totalReports: number;
  totalDownloads: number;
}

export interface ReportActivity {
  id: string;
  name: string;
  dateRange: string;
  generatedOn: string;
  generatedBy: string;
//   downloadUrl?: string; // ⚠️ assumption: not confirmed, needed for the Download button
}

export interface ReportOverviewData {
  summary: ReportSummary;
  recentActivity: ReportActivity[];
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export const reportService = {
  // GET /admin/report/overview -> summary + recent activity
  getOverview: async (): Promise<ApiResponse<ReportOverviewData>> => {
    const res = await api.get<ApiResponse<ReportOverviewData>>(
      `/admin/report/overview`
    );
    return res.data;
  },

  // GET /admin/report/:id/download -> ⚠️ endpoint confirm karna, not seen in Postman yet
//   download: async (id: string): Promise<Blob> => {
//     const res = await api.get(`/admin/report/${id}/download`, {
//       responseType: "blob",
//     });
//     return res.data;
//   },
};