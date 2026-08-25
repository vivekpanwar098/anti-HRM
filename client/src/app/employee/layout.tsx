"use client";

import { useState, type ReactNode } from "react";
import EmployeeAuthWrapper from "@/components/EmployeeAuthWrapper";
import Sidebar from "@/features/sidebar/components/Sidebar";
import Header from "@/features/header/components/Header";
import type { SidebarItemData } from "@/features/sidebar/components/SidebarItem";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Wallet,
  User,
  Settings,
} from "lucide-react";

const navItems: SidebarItemData[] = [
  { label: "Dashboard", Icon: LayoutDashboard, url: "/employee/dashboard" },
  { label: "Attendance", Icon: CalendarCheck, url: "/employee/attendance" },
  { label: "Leaves", Icon: Users, url: "/employee/leaves" },
  { label: "Payroll", Icon: Wallet, url: "/employee/payroll" },
  { label: "Profile", Icon: User, url: "/employee/profile" },
  { label: "Settings", Icon: Settings, url: "/employee/settings" },
];

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <EmployeeAuthWrapper>
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
    </EmployeeAuthWrapper>
  );
}
