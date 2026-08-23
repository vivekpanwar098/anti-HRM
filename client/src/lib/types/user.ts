export interface User {
  name: string;
  role: "employee" | "admin" | "hr";
  profileImage?: string;
}
