"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  Download, 
  Printer, 
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Wallet,
  Receipt
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerModal } from "@/components/customers/CustomerModal";
import { DocumentUploaderModal } from "@/components/documents/DocumentUploaderModal";
import { EventModal } from "@/components/calendar/EventModal";
import { downloadContractPdf, printContractPdf } from "@/lib/pdf/pdfGenerator";
import { formatCurrency, formatDate, formatTimeAgo, getInitials } from "@/lib/utils";
import {
  calculatePaidCashToDate,
  calculateAnnualARR,
  calculateMonthlyMRR,
  calculatePendingReceivables,
  calculateCustomerPaidTotal
} from "@/lib/financials/financialCalculations";

export default function DashboardPage() {
  const { 
    activeOrg, 
    isDemoMode, 
    customers, 
    contracts, 
    invoices,
    notes, 
    events,
    currentRole 
  } = useTenant();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Financial calculations from strict ledger
  const totalPaidCash = calculatePaidCashToDate(invoices);
  const annualARR = calculateAnnualARR(customers);
  const monthlyMRR = calculateMonthlyMRR(customers);
  const pendingReceivables = calculatePendingReceivables(invoices);

  const activeCount = (customers || []).filter((c) => c.status === "active").length;
  const betaCount = (customers || []).filter(
    (c) => (c.financials?.recurringAmount || 0) === 0 && (c.financials?.setupFee || 0) === 0
  ).length;
  const signedContracts = (contracts || []).filter((d) => d.status === "signed");

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {activeOrg.name} Overview
            </h1>
            {isDemoMode && (
              <Badge variant="success" className="gap-1 text-[11px] uppercase font-bold py-0.5">
                <Sparkles className="h-3 w-3" />
                Demo Sandbox
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise Client Operations, Legal Contracts, and Realized Financial Hub.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => setIsCustomerModalOpen(true)}
            variant="gradient"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Customer</span>
          </Button>

          <Button
            onClick={() => setIsDocModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Upload Contract</span>
          </Button>

          <Button
            onClick={() => setIsEventModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <CalendarIcon className="h-4 w-4 text-indigo-600" />
            <span>Schedule</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards: Active Accounts, Total Collected to Date, ARR, MRR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-gradient-to-br from-card to-indigo-500/5 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Client Accounts
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{activeCount}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                {customers.length} total {betaCount > 0 ? `(${betaCount} beta/free)` : "in pipeline"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Collected to Date (Realized Cash strictly from Paid Invoices) */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-emerald-500/5 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Collected to Date
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {currentRole === "admin" ? formatCurrency(totalPaidCash) : "Restricted"}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {pendingReceivables > 0
                  ? `+ ${formatCurrency(pendingReceivables)} pending`
                  : "Realized cash from paid invoices"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Annual Recurring (ARR) */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-purple-500/5 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Annual Recurring (ARR)
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {currentRole === "admin" ? formatCurrency(annualARR) : "Restricted"}
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                Active Annual Retainers
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Recurring (MRR) strictly for monthly clients */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-sky-500/5 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Recurring (MRR)
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {currentRole === "admin" ? formatCurrency(monthlyMRR) : "Restricted"}
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mt-1">
                {monthlyMRR > 0 ? "Active Monthly Retainers" : "$0.00/mo active"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customers & Latest Signed Contracts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Customer Accounts */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Key Accounts & Clients
                </CardTitle>
                <CardDescription className="text-xs">
                  Active municipal and commercial relationships
                </CardDescription>
              </div>
              <Link
                href="/customers"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {customers.length === 0 ? (
                  <p className="p-6 text-center text-xs text-muted-foreground">
                    No customers added yet.
                  </p>
                ) : (
                  customers.slice(0, 4).map((c) => {
                    const customerPaid = calculateCustomerPaidTotal(c.id, invoices);
                    const isBeta = (c.financials?.recurringAmount || 0) === 0 && (c.financials?.setupFee || 0) === 0;

                    return (
                      <Link
                        key={c.id}
                        href={`/customers/${c.id}`}
                        className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors block"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-foreground">{c.name}</h4>
                              <Badge
                                variant={c.status === "active" ? "success" : "secondary"}
                                className="text-[10px] uppercase font-bold"
                              >
                                {c.status.replace("_", " ")}
                              </Badge>
                              {isBeta && (
                                <Badge variant="outline" className="text-[10px] font-semibold border-indigo-500/30 text-indigo-600">
                                  Beta / $0
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {c.contacts[0]?.name || "Executive Lead"} • {c.industry || "General"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="font-bold text-foreground block">
                            {isBeta ? "Free Tier" : formatCurrency(c.financials?.totalContractValue || 0)}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                            {customerPaid > 0 ? `Paid: ${formatCurrency(customerPaid)}` : "No payments yet"}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Executed Contracts */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Executed Contracts & Documents
                </CardTitle>
                <CardDescription className="text-xs">
                  Legally signed agreements with verified digital audit trails
                </CardDescription>
              </div>
              <Link
                href="/documents"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>All Documents</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {contracts.length === 0 ? (
                  <p className="p-6 text-center text-xs text-muted-foreground">
                    No documents on file.
                  </p>
                ) : (
                  contracts.slice(0, 3).map((doc) => {
                    const cust = customers.find((c) => c.id === doc.customerId);
                    return (
                      <div
                        key={doc.id}
                        className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{doc.title}</h4>
                            <p className="text-[11px] text-muted-foreground">
                              {cust?.name || doc.customerName} • {formatDate(doc.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={doc.status === "signed" ? "success" : "secondary"}
                            className="text-[10px] uppercase font-bold"
                          >
                            {doc.status.replace("_", " ")}
                          </Badge>
                          <Button
                            onClick={() =>
                              downloadContractPdf({
                                document: doc,
                                customer: cust,
                                org: activeOrg,
                              })
                            }
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Schedule & Activity Stream */}
        <div className="space-y-6">
          {/* Upcoming Schedule */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Upcoming Meetings
                </CardTitle>
                <CardDescription className="text-xs">
                  Schedule board & client presentations
                </CardDescription>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Calendar →
              </Link>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {events.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No upcoming meetings scheduled.
                </p>
              ) : (
                events.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground truncate max-w-[180px]">
                        {evt.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold uppercase">
                        {evt.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-indigo-500" />
                      <span>{formatDate(evt.start)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Notes Stream */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold text-foreground">
                Team Updates & Mentions
              </CardTitle>
              <CardDescription className="text-xs">
                Latest client notes and tagged conversations
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {notes.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No team activity recorded yet.
                </p>
              ) : (
                notes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{note.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                      {note.customerName}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      <DocumentUploaderModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </div>
  );
}
