import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "$0";
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPhoneNumber(value: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
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

/**
 * Replaces dynamic merge tags (e.g. {{customer_name}}, {{setup_fee}}) with customer data
 */
export function replaceMergeTags(
  templateText: string,
  customer?: any,
  customValues?: Record<string, string>
): string {
  if (!templateText) return "";
  let text = templateText;

  const replacements: Record<string, string> = {
    "{{customer_name}}": customer?.name || "Client Organization",
    "{{product_name}}": customer?.primaryProduct || "GovStax",
    "{{contact_name}}": customer?.contacts?.[0]?.name || "Authorized Representative",
    "{{contact_title}}": customer?.contacts?.[0]?.title || "Authorized Signer",
    "{{contact_email}}": customer?.contacts?.[0]?.email || "contact@client.com",
    "{{contact_phone}}": customer?.contacts?.[0]?.phone || "N/A",
    "{{address}}": customer?.address
      ? `${customer.address.street || ""}, ${customer.address.city || ""}, ${customer.address.state || ""} ${customer.address.zip || ""}`
      : "Client Address on File",
    "{{setup_fee}}": customer?.financials?.setupFee
      ? formatCurrency(customer.financials.setupFee)
      : "$0",
    "{{recurring_amount}}": customer?.financials?.recurringAmount
      ? formatCurrency(customer.financials.recurringAmount)
      : "$0",
    "{{billing_cycle}}": customer?.financials?.billingCycle === "annually"
      ? "annual"
      : customer?.financials?.billingCycle === "monthly"
      ? "monthly"
      : customer?.financials?.billingCycle === "quarterly"
      ? "quarterly"
      : "one-time",
    "{{total_investment}}": customer?.financials?.totalContractValue
      ? formatCurrency(customer.financials.totalContractValue)
      : "$0",
    "{{date}}": format(new Date(), "MMMM d, yyyy"),
    ...(customValues || {}),
  };

  Object.entries(replacements).forEach(([tag, val]) => {
    const escapedTag = tag.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    text = text.replace(new RegExp(escapedTag, "gi"), val);
  });

  return text;
}

/**
 * Generates a direct 1-click Google Calendar web creation URL
 */
export function generateGoogleCalendarUrl(options: {
  title: string;
  description?: string;
  location?: string;
  start: number;
  end: number;
  attendeeEmails?: string[];
}): string {
  const formatGCalDate = (ts: number) => {
    return new Date(ts).toISOString().replace(/-|:|\.\d+/g, "");
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: options.title,
    dates: `${formatGCalDate(options.start)}/${formatGCalDate(options.end)}`,
    details: options.description || "",
    location: options.location || "",
  });

  if (options.attendeeEmails && options.attendeeEmails.length > 0) {
    params.set("add", options.attendeeEmails.filter(Boolean).join(","));
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and downloads a universal .ics file for Outlook, Apple, or Google Calendar
 */
export function downloadIcsFile(event: {
  title: string;
  description?: string;
  location?: string;
  start: number;
  end: number;
}) {
  const formatIcsDate = (ts: number) => {
    return new Date(ts).toISOString().replace(/-|:|\.\d+/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Staxify//StaxHQ CRM//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@staxify.com`,
    `DTSTAMP:${formatIcsDate(Date.now())}`,
    `DTSTART:${formatIcsDate(event.start)}`,
    `DTEND:${formatIcsDate(event.end)}`,
    `SUMMARY:${event.title.replace(/\n/g, " ")}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location || "Staxify Operations"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${(event.title || "meeting").toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
