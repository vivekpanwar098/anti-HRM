import api from "@/lib/utils/axios";

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
  reason: string;
  approver: string;
}

export interface LeaveSummary {
  pendingRequests: number;
  approved: number;
  rejected: number;
  totalRequests: number;
}

export interface LeaveOverviewData {
  summary: LeaveSummary;
  leaves: LeaveRequest[]; // ⚠️ assumption: confirm actual key name (leaves/requests/data)
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const leaveService = {
  // GET /admin/leaves/overview?page=&limit= -> summary + list dono
  getOverview: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<LeaveOverviewData>> => {
    const res = await api.get<ApiResponse<LeaveOverviewData>>(
      `/admin/leaves/overview?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  // PATCH /admin/leaves/:id/status -> approve/reject karna (⚠️ endpoint confirm karna)
  updateStatus: async (
    id: string,
    status: "Approved" | "Rejected"
  ): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.patch<ApiResponse<LeaveRequest>>(
      `/admin/leaves/${id}/status`,
      { status }
    );
    return res.data;
  },

  // DELETE /admin/leaves/:id -> leave request delete karna (⚠️ endpoint confirm karna)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/admin/leaves/${id}`);
    return res.data;
  },
};