"use client";

import { SidebarCloseIcon, CircleHelp, LucideLogOut } from "lucide-react";
import SidebarItem, { type SidebarItemData } from "@/components/SidebarItem";

import Image from "next/image";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import { User } from "@/types/user";

type SidebarProps = {
  items?: SidebarItemData[];
  user?: User;
  isOpen: boolean;
  closeSidebar: () => void;
};

export default function Sidebar({ items, isOpen, closeSidebar }: SidebarProps) {
  const { user } = useAuth();
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-sidebar/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-65 flex-col bg-sidebar text-sidebar-text transition-all duration-300 lg:w-64 xl:w-70 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header  */}
        <div className="flex h-16 w-full items-center justify-between border-b border-b-sidebar-divider px-4 py-2 sm:px-5 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/anti-bikli-logo.png"
              width={100}
              height={100}
              alt="Anti Bikli Ventures Logo"
              className="h-6 w-auto"
              loading="lazy"
            />
            <span className="text-lg font-bold">Anti Bikli</span>
          </Link>
          <button className="lg:hidden cursor-pointer" onClick={closeSidebar}>
            <SidebarCloseIcon />
          </button>
        </div>

        {/* Sidebar items container  */}
        <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-1 px-3 py-4 sm:px-4 lg:px-5">
          {items?.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </div>

        {/* Sidebar Footer  */}
        <div className="w-full border-t border-t-sidebar-divider p-4 text-sm sm:p-5 lg:p-6">
          <Link
            href="/help"
            className="flex gap-2 text-sidebar-text/80 hover:text-sidebar-text"
          >
            <CircleHelp className="h-4 w-4 shrink-0" />
            <span>Help & Support</span>
          </Link>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              {user?.profileImage ? (
                <Image
                  src={user?.profileImage}
                  alt="User profile image"
                  className="h-10 w-10 object-cover rounded-full border-2 "
                />
              ) : (
                <span className="h-10 w-10 object-cover rounded-full bg-theme text-white flex items-center justify-center">
                  {user?.name[0]}
                </span>
              )}
              <span>
                <h4 className="font-bold">{user?.name}</h4>
                <p className="text-xs">{user?.role}</p>
              </span>
            </div>
            <button className="cursor-pointer text-sidebar-text/40 hover:text-sidebar-text">
              <LucideLogOut className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
