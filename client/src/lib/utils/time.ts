export const formatRelativeTime = (value: string | Date) => {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "just now";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.max(0, Math.floor(diffMinutes / 60));
  const diffDays = Math.max(0, Math.floor(diffHours / 24));
  const diffMonths = Math.max(0, Math.floor(diffDays / 30));
  const diffYears = Math.max(0, Math.floor(diffMonths / 12));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};
