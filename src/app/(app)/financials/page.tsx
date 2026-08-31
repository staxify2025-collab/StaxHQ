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
  Filter
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { appConfig } from "@/config/appConfig";

export default function FinancialsPage() {
  const { customers, activeOrg, currentRole, products } = useTenant();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

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

  // Filter customers by product & payment status
  const productFilteredCustomers = customers.filter((c) => {
    if (selectedProduct === "all") return true;
    const prod = c.primaryProduct || "GovStax";
    return prod.toLowerCase() === selectedProduct.toLowerCase();
  });

  const tableFilteredCustomers = productFilteredCustomers.filter((c) => {
    if (filterStatus === "all") return true;
    return c.financials.paymentStatus === filterStatus;
  });

  // Calculate metrics for selected product
  const totalPortfolioValue = productFilteredCustomers.reduce(
    (acc, c) => acc + (c.financials.totalContractValue || 0),
    0
  );

  const totalBuildFees = productFilteredCustomers.reduce(
    (acc, c) => acc + (c.financials.setupFee || 0),
    0
  );

  const monthlyMRR = productFilteredCustomers.reduce(
    (acc, c) =>
      acc +
      (c.financials.billingCycle === "monthly"
        ? c.financials.recurringAmount
        : c.financials.billingCycle === "quarterly"
        ? c.financials.recurringAmount / 3
        : c.financials.billingCycle === "annually"
        ? c.financials.recurringAmount / 12
        : 0),
    0
  );

  const annualARR = productFilteredCustomers.reduce(
    (acc, c) =>
      acc +
      (c.financials.billingCycle === "monthly"
        ? c.financials.recurringAmount * 12
        : c.financials.billingCycle === "quarterly"
        ? c.financials.recurringAmount * 4
        : c.financials.billingCycle === "annually"
        ? c.financials.recurringAmount
        : 0),
    0
  );

  const avgContractValue =
    productFilteredCustomers.length > 0 ? totalPortfolioValue / productFilteredCustomers.length : 0;

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
            Track MRR/ARR, one-time build fees, retainer agreements, and sort by software product.
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

      {/* Product Filter Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border/80 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
          <Layers className="h-4 w-4 text-indigo-500" />
          <span>Product Filter:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {productOptions.map((prod) => {
            const isSelected = selectedProduct === prod;
            const count =
              prod === "all"
                ? customers.length
                : customers.filter(
                    (c) => (c.primaryProduct || "GovStax").toLowerCase() === prod.toLowerCase()
                  ).length;

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
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-primary-foreground/20 text-white" : "bg-muted text-muted-foreground font-bold"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats (Segmented by selected product) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {selectedProduct === "all" ? "Monthly Recurring (MRR)" : `${selectedProduct} MRR`}
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
                {selectedProduct === "all" ? "Annual Run Rate (ARR)" : `${selectedProduct} ARR`}
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(annualARR)}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                Annual Subscription Pace
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
                Total Contract Portfolio
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalPortfolioValue)}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Includes {formatCurrency(totalBuildFees)} Build Fees
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
                One-Time Build Fees
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalBuildFees)}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                Setup & Onboarding Book
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
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">
                Client Financial & Billing Schedules
              </CardTitle>
              {selectedProduct !== "all" && (
                <Badge variant="purple" className="text-[10px] font-bold">
                  {selectedProduct} only
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Itemized build fees, ongoing retainer cycles, and renewal dates
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
                  <th className="p-4">Product</th>
                  <th className="p-4">Build / Setup Fee</th>
                  <th className="p-4">Ongoing Retainer</th>
                  <th className="p-4">First Year Total</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Next Renewal</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tableFilteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No billing records found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  tableFilteredCustomers.map((cust) => {
                    const setup = cust.financials.setupFee || 0;
                    const recurring = cust.financials.recurringAmount || 0;
                    const cycle = cust.financials.billingCycle;
                    const firstYrRecurring =
                      cycle === "monthly"
                        ? recurring * 12
                        : cycle === "quarterly"
                        ? recurring * 4
                        : cycle === "annually"
                        ? recurring
                        : 0;
                    const firstYrTotal = setup + firstYrRecurring;

                    return (
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
                        <td className="p-4">
                          <Badge variant="purple" className="text-[10px] font-semibold">
                            {cust.primaryProduct || "GovStax"}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium text-foreground">
                          {setup > 0 ? formatCurrency(setup) : "—"}
                        </td>
                        <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(recurring)} / {cycle === "annually" ? "yr" : cycle === "monthly" ? "mo" : cycle === "quarterly" ? "qtr" : "one-time"}
                        </td>
                        <td className="p-4 font-bold text-foreground">
                          {formatCurrency(firstYrTotal || cust.financials.totalContractValue)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
