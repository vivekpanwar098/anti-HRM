import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

type AvatarProps = {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={sizePx[size]}
        height={sizePx[size]}
        className={cn("shrink-0 rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  return (
    <span
      aria-label={name}
      title={name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-theme font-semibold text-white",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
