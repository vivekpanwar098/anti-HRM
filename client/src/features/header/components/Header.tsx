"use client";

import { useEffect, useRef, useState } from "react";
import { MenuIcon, Bell, LogOut, User, PlusIcon } from "lucide-react";
import useAuth from "@/features/auth/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import NotificationPanel from "@/components/NotificationPanel";
import api from "@/services/axios";
import { toast } from "sonner";

type HeaderProps = {
  openSidebar: () => void;
};

export default function Header({ openSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target))
        setOpen(false);
    }

    api
      .get("/notifications/unread")
      .then((res) => setUnreadNotificationCount(res.data.notificationsCount))
      .catch(() => toast.error("Failed to fetch unread notifications count"));

    document.addEventListener("click", onDoc);

    return () => document.removeEventListener("click", onDoc);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="w-full bg-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:justify-end">
        {/* Mobile: sidebar toggle (hidden on lg and above) */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={openSidebar}
          aria-label="Open sidebar"
        >
          <MenuIcon className="h-6 w-6 shrink-0" />
        </button>

        <div className="flex gap-6">
          {/* Add Employee button  */}
          {user && user.role === "admin" && (
            <Link
              href="/admin/employees/new"
              className="p-2 bg-theme/80 hover:bg-theme flex gap-2 text-gray-100 hover:text-white rounded-lg text-sm items-center transition duration-400"
            >
              <PlusIcon className="h-4 w-4 shrink-0" /> Add Employee
            </Link>
          )}

          {/* Notification button */}
          <button
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Notifications"
            onClick={() => setIsNotificationPanelOpen((v) => !v)}
          >
            <Bell />

            {/* notification badge  */}
            {Boolean(unreadNotificationCount) && (
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-theme flex items-center justify-center text-[10px] text-white border-2 border-white">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>

          {isNotificationPanelOpen && (
            <NotificationPanel
              closeNotificationPanel={() => setIsNotificationPanelOpen(false)}
              unreadNotificationCount={unreadNotificationCount}
              setUnreadNotificationCount={(count) =>
                setUnreadNotificationCount(count)
              }
            />
          )}
          {/* Profile dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 p-0.5 rounded-full focus:outline-none bg-white ring-1 ring-gray-200 shadow-sm"
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Profile menu"
            >
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user?.name ?? "Profile"}
                  width={100}
                  height={100}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                  {initials}
                </div>
              )}
            </button>

            {isNotificationPanelOpen && (
              <NotificationPanel
                closeNotificationPanel={() => setIsNotificationPanelOpen(false)}
                unreadNotificationCount={unreadNotificationCount}
              />
            )}

            {open && (
              <div
                role="menu"
                className="absolute top-full right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="py-1">
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    role="menuitem"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center gap-2"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
