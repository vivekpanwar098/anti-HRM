"use client";

import { useState, type ReactNode } from "react";
import AdminAuthWrapper from "@/components/AdminAuthWrapper";
import Sidebar from "@/features/sidebar/components/Sidebar";
import Header from "@/features/header/components/Header";
import type { SidebarItemData } from "@/features/sidebar/components/SidebarItem";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Wallet,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems: SidebarItemData[] = [
  { label: "Dashboard", Icon: LayoutDashboard, url: "/admin/dashboard" },
  { label: "Attendance", Icon: CalendarCheck, url: "/admin/attendance" },
  { label: "Employees", Icon: Users, url: "/admin/employees" },
  { label: "Leaves", Icon: FileText, url: "/admin/leaves" },
  { label: "Payroll", Icon: Wallet, url: "/admin/payroll" },
  { label: "Documents", Icon: FileText, url: "/admin/documents" },
  { label: "Announcements", Icon: Megaphone, url: "/admin/announcements" },
  { label: "Reports", Icon: BarChart3, url: "/admin/reports" },
  { label: "Settings", Icon: Settings, url: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-primary-bg text-primary">
        <Sidebar
          items={navItems}
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen flex-col lg:pl-64 xl:pl-70">
          <Header openSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AdminAuthWrapper>
  );
}
