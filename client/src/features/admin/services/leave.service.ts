import api from "@/lib/utils/axios";

// 🔧 FIX: backend lowercase status bhejta hai, aur "cancelled" bhi ek valid status hai
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

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
  actions?: {
    canApprove: boolean;
    canReject: boolean;
  };
}

export interface LeaveSummary {
  pendingRequests: number;
  approved: number;
  rejected: number;
  totalRequests: number;
}

export interface LeaveOverviewData {
  summary: LeaveSummary;
  leaves: LeaveRequest[];
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

  // ✅ NEW: GET /leaves/:id — single leave detail for the view modal.
  // Follows the same base path as approve/reject/delete below (no "/admin" prefix).
  // ⚠️ If this 404s, check the Postman collection for the exact detail-route path
  // and update this one line — everything else (modal, fallback to row data) stays the same.
  getById: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`);
    return res.data;
  },

  // 🔧 FIX: PATCH /leaves/:id/approve — no "/admin" prefix, no body
  approve: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.patch<ApiResponse<LeaveRequest>>(
      `/leaves/${id}/approve`
    );
    return res.data;
  },

  // 🔧 FIX: PATCH /leaves/:id/reject — no "/admin" prefix, no body
  reject: async (id: string): Promise<ApiResponse<LeaveRequest>> => {
    const res = await api.patch<ApiResponse<LeaveRequest>>(
      `/leaves/${id}/reject`
    );
    return res.data;
  },


  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/leaves/${id}`);
    return res.data;
  },
};