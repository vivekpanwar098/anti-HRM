import api from "@/lib/utils/axios";

export interface Employee {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  baseSalary?: number;
  password?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type EmployeeFormData = Omit<
  Employee,
  "_id" | "createdAt" | "updatedAt" | "isActive"
>;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const employeeService = {
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    const res = await api.get<ApiResponse<Employee[]>>("/admin/employees");
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    const res = await api.get<ApiResponse<Employee>>(
      `/admin/employees/${id}`
    );
    return res.data;
  },

  create: async (
    employeeData: EmployeeFormData
  ): Promise<ApiResponse<Employee>> => {
    const res = await api.post<ApiResponse<Employee>>(
      "/admin/employees",
      employeeData
    );
    return res.data;
  },

  update: async (
    id: string,
    employeeData: Partial<EmployeeFormData>
  ): Promise<ApiResponse<Employee>> => {
    const res = await api.patch<ApiResponse<Employee>>(
      `/admin/employees/${id}`,
      employeeData
    );
    return res.data;
  },

  toggleActive: async (id: string): Promise<ApiResponse<Employee>> => {
    const res = await api.patch<ApiResponse<Employee>>(
      `/admin/employees/${id}/toggle-active`
    );
    return res.data;
  },

  resetPassword: async (
    id: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await api.patch<ApiResponse<{ message: string }>>(
      `/admin/employees/${id}/reset-password`,
      { newPassword }
    );
    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(
      `/admin/employees/${id}`
    );
    return res.data;
  },
};