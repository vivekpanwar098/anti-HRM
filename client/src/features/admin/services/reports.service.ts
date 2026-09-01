import api from "@/lib/utils/axios";

export interface ReportSummary {
  totalReports: number;
  totalDownloads: number;
}

export interface ReportActivity {
  id: string;
  name: string;
  type: string;
  periodStart: string | null;
  periodEnd: string | null;
  generatedBy: string;
  createdAt: string;
  status: string;
  fileUrl: string;
}

export interface ReportOverviewData {
  summary: ReportSummary;
  recentReports: ReportActivity[];
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface CreateReportPayload {
  name: string;
  type: string;
  file: File;
  periodStart?: string; 
  periodEnd?: string; 
}

export const reportService = {
  getOverview: async (): Promise<ApiResponse<ReportOverviewData>> => {
    const res = await api.get<ApiResponse<ReportOverviewData>>(
      `/admin/report/overview`
    );
    return res.data;
  },

  list: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<ReportActivity[]> & { pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const res = await api.get(`/report`, { params: { page, limit } });
    return res.data;
  },

  create: async (
    payload: CreateReportPayload
  ): Promise<ApiResponse<ReportActivity>> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("type", payload.type);
    formData.append("file", payload.file);
    if (payload.periodStart) formData.append("periodStart", payload.periodStart);
    if (payload.periodEnd) formData.append("periodEnd", payload.periodEnd);

    const res = await api.post<ApiResponse<ReportActivity>>(
      `/report`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  download: async (id: string): Promise<Blob> => {
    const res = await api.get(`/report/${id}/download`, {
      responseType: "blob",
    });
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/report/${id}`);
  },
};