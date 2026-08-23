"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItemData = {
  label: string;
  Icon: LucideIcon;
  url: string;
};

type SidebarItemProps = {
  item: SidebarItemData;
};

export default function SidebarItem({ item }: SidebarItemProps) {
  const { label, Icon, url } = item;

  const pathname = usePathname();

  const isActive = pathname === url;

  return (
    <Link
      href={url}
      className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-sidebar-text/80 transition-colors duration-200  hover:text-sidebar-text ${isActive ? "bg-sidebar-active-bg " : "hover:bg-sidebar-hover-bg"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
