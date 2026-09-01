import api from "@/lib/utils/axios";


export type PayrollStatus =
  | "not_calculated"
  | "draft"
  | "calculated"
  | "approved"
  | "paid";

export interface PayrollRow {
  
  payrollId: string | null;
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number; 
  deductions: number | null;
  netSalary: number | null;
  status: PayrollStatus;
}

export interface PayrollSummary {
  totalPayroll: number;
  employeesPaid: number;
  pendingPayroll: number;
  totalDeductions: number;
}

export interface PayrollOverviewData {
  summary: PayrollSummary;
  rows: PayrollRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PayrollLineItem {
  label: string;
  amount: number;
}


export interface PayrollDetail {
  payrollId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: PayrollStatus;
  scheduledWorkingDays: number;
  workedDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  earnings: PayrollLineItem[];
  totalEarnings: number;
  deductionsBreakdown: PayrollLineItem[];
  totalDeductions: number;
  netSalary: number;
}


interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface OverviewFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  month?: number;
  year?: number;
}

export interface CalculateParams {
  employeeId: string;
  scheduledWorkingDays: number; // required — the backend has no auto-calc
  month?: number;
  year?: number;
}

export interface CalculateBulkParams {
  scheduledWorkingDays: number; // required — applies to every full-month employee
  month?: number;
  year?: number;
}

export interface CalculateBulkResult {
  processedCount: number;
  processed: string[];
  skipped: { employeeId: string; reason: string }[];
}

export interface ManualCorrection {
  scheduledWorkingDays?: number;
  workedDays?: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  payableSalary?: number; 
}

export const payrollService = {
 
  getOverview: async (
    filters: OverviewFilters = {},
  ): Promise<ApiEnvelope<PayrollOverviewData>> => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.search) params.set("search", filters.search);
    if (filters.department) params.set("department", filters.department);
    if (filters.status) params.set("status", filters.status);
    if (filters.month) params.set("month", String(filters.month));
    if (filters.year) params.set("year", String(filters.year));

    const res = await api.get<ApiEnvelope<PayrollOverviewData>>(
      `/payroll/overview?${params.toString()}`,
    );
    return res.data;
  },

  
  getById: async (payrollId: string): Promise<ApiEnvelope<PayrollDetail>> => {
    const res = await api.get<ApiEnvelope<PayrollDetail>>(`/payroll/${payrollId}`);
    return res.data;
  },

  calculate: async (params: CalculateParams): Promise<ApiEnvelope<PayrollDetail>> => {
    const res = await api.post<ApiEnvelope<PayrollDetail>>("/payroll/calculate", params);
    return res.data;
  },

  
  calculateBulk: async (
    params: CalculateBulkParams,
  ): Promise<ApiEnvelope<CalculateBulkResult & { month: number; year: number }>> => {
    const res = await api.post<ApiEnvelope<CalculateBulkResult & { month: number; year: number }>>(
      "/payroll/calculate-bulk",
      params,
    );
    return res.data;
  },

  // PATCH /payroll/:payrollId — manual correction of an EXISTING record.
  // Only send the fields actually changing.
  update: async (
    payrollId: string,
    payload: ManualCorrection,
  ): Promise<ApiEnvelope<PayrollDetail>> => {
    const res = await api.patch<ApiEnvelope<PayrollDetail>>(`/payroll/${payrollId}`, payload);
    return res.data;
  },

  // PATCH /payroll/:payrollId/status — the ONLY endpoint that can ever set
  // status to "paid". Calculation never touches status beyond "calculated".
  updateStatus: async (
    payrollId: string,
    status: "approved" | "paid",
  ): Promise<ApiEnvelope<PayrollDetail>> => {
    const res = await api.patch<ApiEnvelope<PayrollDetail>>(`/payroll/${payrollId}/status`, {
      status,
    });
    return res.data;
  },

  // DELETE /payroll/:payrollId
  delete: async (payrollId: string): Promise<ApiEnvelope<null>> => {
    const res = await api.delete<ApiEnvelope<null>>(`/payroll/${payrollId}`);
    return res.data;
  },
};
