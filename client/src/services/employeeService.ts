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

export type EmployeeFormData = Omit<Employee, "_id" | "createdAt" | "updatedAt" | "isActive">;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const employeeService = {
  // GET /admin/employees -> sab employees fetch karna
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    const res = await api.get<ApiResponse<Employee[]>>("/admin/employees");
    return res.data;
  },

  // GET /admin/employees/:id -> single employee fetch karna
  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    const res = await api.get<ApiResponse<Employee>>(`/admin/employees/${id}`);
    return res.data;
  },

  // POST /admin/employees -> naya employee add karna
  create: async (employeeData: EmployeeFormData): Promise<ApiResponse<Employee>> => {
    const res = await api.post<ApiResponse<Employee>>("/admin/employees", employeeData);
    return res.data;
  },

  // PATCH /admin/employees/:id -> employee update karna
  update: async (
    id: string,
    employeeData: Partial<EmployeeFormData>
  ): Promise<ApiResponse<Employee>> => {
    const res = await api.patch<ApiResponse<Employee>>(`/admin/employees/${id}`, employeeData);
    return res.data;
  },

  // DELETE /admin/employees/:id -> employee delete karna
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/admin/employees/${id}`);
    return res.data;
  },
};