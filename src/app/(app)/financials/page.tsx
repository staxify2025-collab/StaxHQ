"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  Printer, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  ShieldCheck,
  Layers,
  Sparkles,
  Filter,
  FileText,
  Send,
  Plus,
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
  Wallet,
  Trash2
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceReviewModal } from "@/components/financials/InvoiceReviewModal";
import { BankTransactionsLedger } from "@/components/financials/BankTransactionsLedger";
import { BankStatementUploaderModal } from "@/components/financials/BankStatementUploaderModal";
import { VendorSaaSBreakdown } from "@/components/financials/VendorSaaSBreakdown";
import { PartnerDrawsAndPnL } from "@/components/financials/PartnerDrawsAndPnL";
import { Invoice } from "@/types/crm";
import { downloadInvoicePdf, printInvoicePdf } from "@/lib/pdf/pdfGenerator";
import {
  calculatePaidCashToDate,
  calculateAnnualARR,
  calculateMonthlyMRR,
  calculatePendingReceivables,
  calculateTotalPortfolioValue
} from "@/lib/financials/financialCalculations";
import { Receipt, Cpu, Users } from "lucide-react";

export default function FinancialsPage() {
  const { 
    customers, 
    invoices, 
    activeOrg, 
    currentRole, 
    products, 
    generateRenewalInvoice,
    deleteInvoice 
  } = useTenant();
  
  const [activeTab, setActiveTab] = useState<string>("invoicing");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBankUploaderOpen, setIsBankUploaderOpen] = useState(false);

  if (currentRole === "employee") {
    return (
      <div className="py-16 text-center space-y-3">
        <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Restricted Financial Access</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Your current employee role does not have administrative permission to view company revenue and billing metrics.
        </p>
      </div>
    );
  }

  // Extract products from tenant context
  const productOptions = Array.from(new Set(["all", ...products]));

  // Filter invoices
  const filteredInvoices = (invoices || []).filter((inv) => {
    if (invoiceStatusFilter !== "all" && inv.status !== invoiceStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter customers by product
  const productFilteredCustomers = (customers || []).filter((c) => {
    if (selectedProduct === "all") return true;
    const prod = c.primaryProduct || "GovStax";
    return prod.toLowerCase() === selectedProduct.toLowerCase();
  });

  // Strict Financial Metrics
  const totalPaidCash = calculatePaidCashToDate(invoices);
  const totalPortfolioValue = calculateTotalPortfolioValue(productFilteredCustomers);
  const monthlyMRR = calculateMonthlyMRR(productFilteredCustomers);
  const annualARR = calculateAnnualARR(productFilteredCustomers);
  const pendingReceivables = calculatePendingReceivables(invoices);

  // Invoice status counts
  const draftCount = (invoices || []).filter((i) => i.status === "draft").length;
  const sentCount = (invoices || []).filter((i) => i.status === "sent" || i.status === "reminder_sent").length;
  const overdueCount = (invoices || []).filter((i) => i.status === "overdue").length;
  const paidCount = (invoices || []).filter((i) => i.status === "paid").length;

  const handleOpenReview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsReviewModalOpen(true);
  };

  const handleQuickDraftForClient = (customerId: string) => {
    const created = generateRenewalInvoice(customerId);
    if (created) {
      setSelectedInvoice(created);
      setIsReviewModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <DollarSign className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            <span>Financials & Automated Invoicing Hub</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated billing lifecycle, client renewal trackers, ARR/MRR metrics, and 1-click Gmail dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print Ledger</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/80 p-1 rounded-2xl border border-border/80 flex flex-wrap gap-1">
          <TabsTrigger value="invoicing" className="gap-2 rounded-xl text-xs font-bold py-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            <span>Invoicing & Client Billing</span>
            {draftCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {draftCount} Action
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="bank_ledger" className="gap-2 rounded-xl text-xs font-bold py-2">
            <Receipt className="h-4 w-4 text-emerald-500" />
            <span>Bank Ledger & Spending</span>
          </TabsTrigger>

          <TabsTrigger value="saas_burn" className="gap-2 rounded-xl text-xs font-bold py-2">
            <Cpu className="h-4 w-4 text-sky-500" />
            <span>Vendor SaaS Burn</span>
          </TabsTrigger>

          <TabsTrigger value="partner_draws" className="gap-2 rounded-xl text-xs font-bold py-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>Partner Draws & Tax P&L</span>
          </TabsTrigger>

          <TabsTrigger value="renewals" className="gap-2 rounded-xl text-xs font-bold py-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>Renewal Calendar</span>
          </TabsTrigger>

          <TabsTrigger value="metrics" className="gap-2 rounded-xl text-xs font-bold py-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Cash Metrics</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INVOICING & RENEWAL QUEUE */}
        <TabsContent value="invoicing" className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card
              onClick={() => setInvoiceStatusFilter("draft")}
              className={`border-border/80 cursor-pointer transition-all hover:border-indigo-500/50 ${
                invoiceStatusFilter === "draft" ? "ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Drafts (Review Needed)
                  </span>
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">{draftCount}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Auto-generated for review</p>
              </CardContent>
            </Card>

            <Card
              onClick={() => setInvoiceStatusFilter("sent")}
              className={`border-border/80 cursor-pointer transition-all hover:border-amber-500/50 ${
                invoiceStatusFilter === "sent" ? "ring-2 ring-amber-500 bg-amber-50/20 dark:bg-amber-950/20" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Sent & Pending
                  </span>
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">{sentCount}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting client payment</p>
              </CardContent>
            </Card>

            <Card
              onClick={() => setInvoiceStatusFilter("overdue")}
              className={`border-border/80 cursor-pointer transition-all hover:border-destructive/50 ${
                invoiceStatusFilter === "overdue" ? "ring-2 ring-destructive bg-destructive/10" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Overdue Notices
                  </span>
                  <div className="h-7 w-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-destructive mt-2">{overdueCount}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Service notice active</p>
              </CardContent>
            </Card>

            <Card
              onClick={() => setInvoiceStatusFilter("paid")}
              className={`border-border/80 cursor-pointer transition-all hover:border-emerald-500/50 ${
                invoiceStatusFilter === "paid" ? "ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Paid in Full
                  </span>
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{paidCount}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Settled receivables</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoices by number or client..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
                {["all", "draft", "sent", "overdue", "paid"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInvoiceStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      invoiceStatusFilter === st
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Quick Generate Draft Trigger */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleQuickDraftForClient(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="h-9 px-3 rounded-xl border border-indigo-500/40 bg-card text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue=""
              >
                <option value="" disabled>+ Generate Invoice for...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({formatCurrency(c.financials?.recurringAmount || 0)}/{c.financials?.billingCycle || "yr"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-4 pl-6">Invoice #</th>
                      <th className="p-4">Client Entity</th>
                      <th className="p-4">Issue Date</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Billing Cycle</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                          <p className="font-semibold text-foreground">No invoices found</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Generate a draft or wait for the automated renewal cycle to trigger.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => {
                        const cust = customers.find((c) => c.id === inv.customerId);
                        return (
                          <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4 pl-6 font-bold text-foreground">
                              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                                {inv.invoiceNumber}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-foreground">
                              <Link
                                href={`/customers/${inv.customerId}`}
                                className="hover:text-primary hover:underline flex items-center gap-1.5"
                              >
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{inv.customerName}</span>
                              </Link>
                            </td>
                            <td className="p-4 text-muted-foreground">{formatDate(inv.issueDate)}</td>
                            <td className="p-4 font-medium text-foreground">{formatDate(inv.dueDate)}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="capitalize text-[10px]">
                                {inv.billingCycle || "annually"}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm font-bold text-foreground">
                              {formatCurrency(inv.total)}
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  inv.status === "paid"
                                    ? "success"
                                    : inv.status === "overdue"
                                    ? "destructive"
                                    : inv.status === "sent"
                                    ? "warning"
                                    : "secondary"
                                }
                                className="text-[10px] uppercase font-bold"
                              >
                                {inv.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  onClick={() => handleOpenReview(inv)}
                                  size="sm"
                                  variant="gradient"
                                  className="gap-1 text-xs h-7 px-2.5 shadow-sm"
                                >
                                  <Send className="h-3 w-3" />
                                  <span>Review & Send</span>
                                </Button>

                                <Button
                                  onClick={() => downloadInvoicePdf({ invoice: inv, customer: cust, org: activeOrg })}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  title="Download PDF"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  onClick={() => printInvoicePdf({ invoice: inv, customer: cust, org: activeOrg })}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  title="Print"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber} for ${inv.customerName}? This action cannot be undone.`)) {
                                      deleteInvoice(inv.id);
                                    }
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: RENEWAL CALENDAR & TRACKER */}
        <TabsContent value="renewals" className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Client Renewal Schedule & Automated Trigger Windows</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly subscriptions generate draft invoices 10 days prior (5-day reminder). Annual/Quarterly agreements generate 30 days prior (7-day reminder).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((cust) => {
                  const fin = cust.financials;
                  const cycle = fin?.billingCycle || "annually";
                  const noticeDays = cycle === "monthly" ? 10 : 30;
                  const reminderDays = cycle === "monthly" ? 5 : 7;
                  const amount = fin?.recurringAmount || 0;

                  return (
                    <Card key={cust.id} className="border-border/80 hover:border-indigo-500/40 transition-all">
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground">
                            {cust.name}
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {cust.primaryProduct || "GovStax"} • <strong className="text-foreground capitalize">{cycle}</strong>
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          Day {fin?.renewalDayOfMonth || 15}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4 pt-1 space-y-3">
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                          <span className="text-muted-foreground">Retainer Amount:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(amount)} / {cycle === "annually" ? "yr" : cycle === "monthly" ? "mo" : "qtr"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Notice Trigger:</span>
                            <strong className="text-foreground">{noticeDays} days prior</strong>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Unpaid Reminder:</span>
                            <strong className="text-foreground">{reminderDays} days prior</strong>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Auto-Invoicing Active</span>
                          </span>
                          <Button
                            onClick={() => handleQuickDraftForClient(cust.id)}
                            size="sm"
                            variant="outline"
                            className="text-[11px] h-7 px-2"
                          >
                            Draft Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: REVENUE & FINANCIAL METRICS */}
        <TabsContent value="metrics" className="space-y-6">
          {/* Product Filter Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/80 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>Product Filter:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {productOptions.map((prod) => {
                const isSelected = selectedProduct === prod;
                return (
                  <button
                    key={prod}
                    onClick={() => setSelectedProduct(prod)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{prod === "all" ? "All Products" : prod}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Metric Cards: Realized Cash, ARR, MRR, Pending Invoices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Realized Cash Collected */}
            <Card className="border-border/80 bg-gradient-to-br from-card to-emerald-500/5 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Paid to Date
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-3">
                  {formatCurrency(totalPaidCash)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Realized cash collected strictly from marked PAID invoices
                </p>
              </CardContent>
            </Card>

            {/* Annual Recurring (ARR) */}
            <Card className="border-border/80 bg-gradient-to-br from-card to-purple-500/5 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Annual Recurring (ARR)
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-foreground mt-3">
                  {formatCurrency(annualARR)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active contracted annual licenses & SLA retainers
                </p>
              </CardContent>
            </Card>

            {/* Monthly Recurring (MRR) - Strict Monthly Only */}
            <Card className="border-border/80 bg-gradient-to-br from-card to-sky-500/5 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Monthly Recurring (MRR)
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-foreground mt-3">
                  {formatCurrency(monthlyMRR)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthlyMRR > 0 ? "Active monthly recurring cashflow" : "$0.00/mo active monthly clients"}
                </p>
              </CardContent>
            </Card>

            {/* Pending Invoices / Receivables */}
            <Card className="border-border/80 bg-gradient-to-br from-card to-amber-500/5 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Pending Receivables
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-3">
                  {formatCurrency(pendingReceivables)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sent, reminder, and overdue invoices awaiting payment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Summary Banner */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Total Multi-Year Contract Commitment Portfolio: <strong className="text-foreground">{formatCurrency(totalPortfolioValue)}</strong>
              </span>
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold">
              {filteredInvoices.length} Total Ledger Invoices
            </Badge>
          </div>
        </TabsContent>

        {/* Bank Transactions & Spending Tab */}
        <TabsContent value="bank_ledger" className="space-y-6">
          <BankTransactionsLedger onOpenUploader={() => setIsBankUploaderOpen(true)} />
        </TabsContent>

        {/* Vendor SaaS Burn Tab */}
        <TabsContent value="saas_burn" className="space-y-6">
          <VendorSaaSBreakdown />
        </TabsContent>

        {/* Partner Draws & Tax P&L Tab */}
        <TabsContent value="partner_draws" className="space-y-6">
          <PartnerDrawsAndPnL />
        </TabsContent>
      </Tabs>

      {/* Invoice Review & Send Modal */}
      <InvoiceReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        invoice={selectedInvoice}
      />

      {/* Bank Statement Uploader Modal */}
      <BankStatementUploaderModal
        isOpen={isBankUploaderOpen}
        onClose={() => setIsBankUploaderOpen(false)}
      />
    </div>
  );
}
