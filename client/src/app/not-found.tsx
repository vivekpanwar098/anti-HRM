"use client";

import useAuth from "@/features/auth/hooks/useAuth";
import { redirect } from "next/navigation";

export default function NotFoundPage() {
  const { user } = useAuth();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "employee") {
    redirect("/employee/dashboard");
  }

  redirect("/admin/dashboard");
}
