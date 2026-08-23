"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import Label from "./Label";
import { cn } from "@/lib/utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({ label, error, className, id, rows = 4, ...props }: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className="flex w-full flex-col gap-1">
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-primary placeholder:text-zinc-400 focus:border-theme focus:outline-none focus:ring-2 focus:ring-theme/30",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
