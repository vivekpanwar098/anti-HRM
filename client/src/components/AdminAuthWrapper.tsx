"use client";

import useAuth from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

export default function AdminAuthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || user.role !== "admin") {
      router.replace("/login");
      toast.error("Please login as admin");
    }
  }, [isAuthLoading, router, user]);

  if (isAuthLoading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") return null;

  return children;
}
