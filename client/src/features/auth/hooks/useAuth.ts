"use client";

import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("Auth context missing");
  return context;
}
