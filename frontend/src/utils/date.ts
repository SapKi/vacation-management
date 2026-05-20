export const MS_PER_DAY = 86_400_000;

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

export function formatRelative(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / MS_PER_DAY);
  if (days === 0) return "Submitted today";
  if (days === 1) return "Submitted yesterday";
  if (days < 7)  return `Submitted ${days} days ago`;
  return `Submitted ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function daysBetween(startDate: string, endDate: string): number {
  return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / MS_PER_DAY) + 1;
}
