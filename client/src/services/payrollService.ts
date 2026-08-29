import api from "@/lib/utils/axios";

export type PaymentStatus = "Paid" | "Pending" | "generated";

export interface PayrollRow {
  employeeId: string;
  employeeName: string;
  department: string;
  designation?: string;
  basicSalary: number;
  allowances: number;
  deductions: number | null;
  netSalary?: number; // ⚠️ assumption: confirm key name, list response didn't show it in screenshot
  status: PaymentStatus;
}

export interface PayrollSummary {
  totalPayroll: number;
  employeesPaid: number;
  pendingPayroll: number;
  totalDeductions: number | null;
}

export interface PayrollOverviewData {
  summary: PayrollSummary;
  rows: PayrollRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// ⚠️ assumption: detail endpoint + shape not visible in the Postman screenshot yet.
// Update the fields below once you confirm GET /admin/payroll/:employeeId (or similar).
export interface PayrollEarningsBreakdown {
  basic: number;
  hra: number;
  conveyance: number;
  otherAllowances: number;
  bonus: number;
  totalEarnings: number;
}

export interface PayrollDeductionsBreakdown {
  pf: number;
  esi: number;
  tax: number;
  otherDeductions: number;
  totalDeductions: number;
}

export interface PayrollDetail extends PayrollRow {
  joiningDate: string;
  earningsBreakdown: PayrollEarningsBreakdown;
  deductionsBreakdown: PayrollDeductionsBreakdown;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const payrollService = {
  // GET /admin/payroll/overview?page=&limit= -> summary + rows dono
  getOverview: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PayrollOverviewData>> => {
    const res = await api.get<ApiResponse<PayrollOverviewData>>(
      `/admin/payroll/overview?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  // GET /admin/payroll/:employeeId -> ek employee ka full breakdown (⚠️ endpoint confirm karna)
  getById: async (employeeId: string): Promise<ApiResponse<PayrollDetail>> => {
    const res = await api.get<ApiResponse<PayrollDetail>>(
      `/admin/payroll/${employeeId}`
    );
    return res.data;
  },

  // POST /admin/payroll -> naya payroll entry add karna (⚠️ endpoint confirm karna)
  create: async (payload: Partial<PayrollRow>): Promise<ApiResponse<PayrollRow>> => {
    const res = await api.post<ApiResponse<PayrollRow>>(`/admin/payroll`, payload);
    return res.data;
  },

  // POST /admin/payroll/process -> "Process Payslip" button (⚠️ endpoint confirm karna)
  processPayslip: async (employeeId: string): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>(
      `/admin/payroll/${employeeId}/process`
    );
    return res.data;
  },

  // DELETE /admin/payroll/:employeeId -> record delete karna (⚠️ endpoint confirm karna)
  delete: async (employeeId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(
      `/admin/payroll/${employeeId}`
    );
    return res.data;
  },
};