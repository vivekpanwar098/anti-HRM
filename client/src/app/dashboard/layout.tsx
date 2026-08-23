"use client";

import { useState, type ReactNode } from "react";
import { CalendarCheck, LayoutDashboard, Menu, Users, Wallet } from "lucide-react";
import Sidebar from "@/features/sidebar/components/Sidebar";
import type { SidebarItemData } from "@/features/sidebar/components/SidebarItem";

const navItems: SidebarItemData[] = [
  { label: "Dashboard", Icon: LayoutDashboard, url: "/dashboard" },
  { label: "Employees", Icon: Users, url: "/dashboard/employees" },
  { label: "Attendance", Icon: CalendarCheck, url: "/dashboard/attendance" },
  { label: "Payroll", Icon: Wallet, url: "/dashboard/payroll" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-bg">
      <Sidebar
        items={navItems}
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen flex-col lg:pl-64 xl:pl-[17.5rem]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-secondary-bg px-4 lg:hidden">
          <button
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer text-primary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-sans text-base font-bold">Company Portal</span>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
