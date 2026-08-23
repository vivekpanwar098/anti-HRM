"use client";

import { useId, type InputHTMLAttributes } from "react";
import Label from "./Label";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="flex w-full flex-col gap-1">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-primary placeholder:text-zinc-400 focus:border-theme focus:outline-none focus:ring-2 focus:ring-theme/30",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
