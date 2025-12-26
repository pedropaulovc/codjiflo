export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 45) {
    return 'just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${String(diffMinutes)} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${String(diffHours)} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${String(diffDays)} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${String(diffMonths)} month${diffMonths === 1 ? '' : 's'} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${String(diffYears)} year${diffYears === 1 ? '' : 's'} ago`;
}
