import { Customer, Invoice } from "@/types/crm";

/**
 * Calculates total realized cash collected to date strictly from invoices marked as "PAID".
 * Excludes drafts, sent, and overdue invoices until payment is confirmed.
 */
export function calculatePaidCashToDate(invoices: Invoice[] = []): number {
  const sum = (invoices || [])
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculates Annual Recurring Revenue (ARR) from active contracted accounts with annual billing.
 */
export function calculateAnnualARR(customers: Customer[] = []): number {
  const sum = (customers || [])
    .filter((c) => c.status === "active" && c.financials?.billingCycle === "annually")
    .reduce((acc, c) => acc + (Number(c.financials?.recurringAmount) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculates pure Monthly Recurring Revenue (MRR) strictly from active monthly accounts.
 * Does NOT take synthetic averages from annual or quarterly retainers.
 */
export function calculateMonthlyMRR(customers: Customer[] = []): number {
  const sum = (customers || [])
    .filter((c) => c.status === "active" && c.financials?.billingCycle === "monthly")
    .reduce((acc, c) => acc + (Number(c.financials?.recurringAmount) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculates total pending / outstanding receivables from sent, reminder-sent, and overdue invoices.
 */
export function calculatePendingReceivables(invoices: Invoice[] = []): number {
  const sum = (invoices || [])
    .filter((inv) => inv.status === "sent" || inv.status === "reminder_sent" || inv.status === "overdue")
    .reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculates total realized cash collected for a specific customer entity from paid invoices.
 */
export function calculateCustomerPaidTotal(customerId: string, invoices: Invoice[] = []): number {
  const sum = (invoices || [])
    .filter((inv) => inv.customerId === customerId && inv.status === "paid")
    .reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculates total contracted commitment portfolio across all active/contracted customers.
 */
export function calculateTotalPortfolioValue(customers: Customer[] = []): number {
  const sum = (customers || [])
    .reduce((acc, c) => acc + (Number(c.financials?.totalContractValue) || 0), 0);
  return Math.round(sum * 100) / 100;
}
