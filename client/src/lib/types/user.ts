export interface User {
  id?: string;
  name: string;
  role: "employee" | "admin" | "hr";
  email?: string;
  employeeId?: string;
  profileImage?: string;
}
