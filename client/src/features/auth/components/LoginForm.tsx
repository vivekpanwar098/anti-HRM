"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";

type Role = "admin" | "employee";

interface LoginResponse {
  message?: string;
  token?: string;
  user?: {
    email: string;
    role: Role;
  };
}

export default function LoginForm() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("@Anshul1234");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const {login} = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    login(email, password).then(()=>setLoading(false)).catch((err: any) => {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    });
  };

  return (
    <form onSubmit={handleLogin} className="w-full max-w-[420px]">
      {error && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-black">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[10px] border-[1.5px] border-[#d9d9dc] px-4 py-3.5 text-[0.95rem] text-black outline-none transition focus:border-[#18A096]"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-black">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? "text" : "password"}
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[10px] border-[1.5px] border-[#d9d9dc] px-4 py-3.5 pr-11 text-[0.95rem] text-black outline-none transition focus:border-[#18A096]"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[10px] bg-[#18A096] py-3.5 font-semibold text-white transition hover:bg-[#12544F] disabled:opacity-70"
      >
        {loading ? "Loading..." : "Sign In"}
      </button>
    </form>
  );
}
