export interface User {
  id: string;
  name: string;
  role: "employee" | "admin";
  email: string;
  employeeId?: string;
  profileImage?: string;
}
