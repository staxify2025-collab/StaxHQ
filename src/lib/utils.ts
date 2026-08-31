import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number | Date | undefined): string {
  if (!timestamp) return "—";
  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  return format(date, "MMM d, yyyy");
}

export function formatTimeAgo(timestamp: number | Date | undefined): string {
  if (!timestamp) return "—";
  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getInitials(name: string): string {
  if (!name) return "HQ";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
