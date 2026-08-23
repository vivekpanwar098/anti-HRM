"use client";

import type { User } from "@/lib/types/user";

export default function useAuth(): { user: User | undefined } {
  return { user: undefined };
}
