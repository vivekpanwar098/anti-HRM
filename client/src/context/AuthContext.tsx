"use client";

import { User } from "@/lib/types/user";
import api from "@/services/axios";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
};

const DefaultAuthContextValue: AuthContextType = {
  user: {
    id: "24224",
    name: "Vishal",
    role: "admin",
    email: "abc@gmail.com",
    employeeId: "234",
  },
  login: async () => {},
  logout: async () => {},
  isAuthLoading: false,
};
export const AuthContext = createContext<AuthContextType>(
  DefaultAuthContextValue,
);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      const res = await api.post("/auth/signin", {
        email,
        password,
      });
      setUser(res.data.user);
      toast.success(`Welcome back ${res.data.user.name.split(" ")[0]}`);
    } catch {
      toast.error("Incorrect email or password");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsAuthLoading(true);
      await api.post("/auth/logout");
    } catch {
    } finally {
      setUser(null);
      setIsAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
