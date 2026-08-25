"use client";

import useAuth from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

export default function EmployeeAuthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || user.role !== "employee") {
      router.replace("/login");
      toast.error("Please login as employee");
    }
  }, [isAuthLoading, router, user]);

  if (isAuthLoading) return <div>Loading...</div>;
  if (!user || user.role !== "employee") return null;

  return children;
}
