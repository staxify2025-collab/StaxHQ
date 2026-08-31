"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function FinancialsPage() {
  const { customers, activeOrg, currentRole } = useTenant();
  const [filterStatus, setFilterStatus] = useState<string>("all");

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

  const totalPortfolioValue = customers.reduce(
    (acc, c) => acc + (c.financials.totalContractValue || 0),
    0
  );

  const monthlyMRR = customers.reduce(
    (acc, c) =>
      acc +
      (c.financials.billingCycle === "monthly"
        ? c.financials.recurringAmount
        : c.financials.recurringAmount / 12),
    0
  );

  const annualARR = monthlyMRR * 12;

  const avgContractValue =
    customers.length > 0 ? totalPortfolioValue / customers.length : 0;

  const filteredCustomers = customers.filter((c) => {
    if (filterStatus === "all") return true;
    return c.financials.paymentStatus === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <DollarSign className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            <span>Financials & Revenue Hub</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time MRR/ARR tracking, retainer agreements, client billing statuses, and renewal timelines.
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
            <span>Print Financial Summary</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Recurring (MRR)
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(monthlyMRR)}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Active Client Retainers
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-indigo-500/5 border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Annual Run Rate (ARR)
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(annualARR)}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                Projected Annual Pace
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-violet-500/5 border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Portfolio Value
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalPortfolioValue)}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Cumulative Contract Book
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Avg. Contract Value (ACV)
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(avgContractValue)}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Per Active Account
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Billing & Contracts Breakdown Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Client Financial & Billing Schedules
            </CardTitle>
            <CardDescription className="text-xs">
              Direct billing records, recurring cycles, and renewal dates by client organization
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            {["all", "current", "pending", "overdue"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterStatus === st
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 pl-6">Client Organization</th>
                  <th className="p-4">Total Contract</th>
                  <th className="p-4">Retainer / Cycle</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Next Renewal</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No billing records found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-foreground">
                        <Link
                          href={`/customers/${cust.id}`}
                          className="hover:text-primary hover:underline flex items-center gap-2"
                        >
                          <Building2 className="h-4 w-4 text-indigo-500" />
                          <span>{cust.name}</span>
                        </Link>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {formatCurrency(cust.financials.totalContractValue)}
                      </td>
                      <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(cust.financials.recurringAmount)} / {cust.financials.billingCycle}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            cust.financials.paymentStatus === "current" ||
                            cust.financials.paymentStatus === "paid"
                              ? "success"
                              : cust.financials.paymentStatus === "pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {cust.financials.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {formatDate(cust.financials.nextRenewalDate)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Link
                          href={`/customers/${cust.id}`}
                          className="text-primary font-semibold hover:underline"
                        >
                          View Account →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
