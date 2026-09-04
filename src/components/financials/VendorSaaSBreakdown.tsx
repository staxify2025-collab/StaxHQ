"use client";

import React, { useMemo } from "react";
import { BankTransaction } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { formatCurrency } from "@/lib/utils";
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  Cloud, 
  Code2, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock,
  Zap,
  ShieldCheck,
  Building2
} from "lucide-react";

interface VendorSummary {
  name: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  monthlyEstimate: number;
  totalYtd: number;
  lastChargedDate: number;
  lastChargedAmount: number;
  chargeCount: number;
}

export function VendorSaaSBreakdown() {
  const { bankTransactions } = useTenant();

  const { vendorList, monthlyTotal, annualRunRate, aiTotal, cloudTotal, devTotal } = useMemo(() => {
    // Filter transactions belonging to SaaS, cloud, and dev categories
    const saasTransactions = (bankTransactions || []).filter(
      (tx) =>
        tx.type === "debit" &&
        (tx.category === "ai_apis" ||
          tx.category === "cloud_infra" ||
          tx.category === "dev_tools" ||
          tx.isRecurring)
    );

    const vendorMap: { [name: string]: VendorSummary } = {};

    saasTransactions.forEach((tx) => {
      const name = tx.payeeClean || tx.description;
      if (!vendorMap[name]) {
        let catLabel = "Developer Tools";
        let catColor = "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";

        if (tx.category === "ai_apis") {
          catLabel = "AI & LLM APIs";
          catColor = "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
        } else if (tx.category === "cloud_infra") {
          catLabel = "Cloud & Hosting";
          catColor = "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30";
        }

        vendorMap[name] = {
          name,
          category: tx.category,
          categoryLabel: catLabel,
          categoryColor: catColor,
          monthlyEstimate: tx.amount,
          totalYtd: 0,
          lastChargedDate: tx.date,
          lastChargedAmount: tx.amount,
          chargeCount: 0,
        };
      }

      vendorMap[name].totalYtd += tx.amount;
      vendorMap[name].chargeCount += 1;

      if (tx.date >= vendorMap[name].lastChargedDate) {
        vendorMap[name].lastChargedDate = tx.date;
        vendorMap[name].lastChargedAmount = tx.amount;
        vendorMap[name].monthlyEstimate = tx.amount;
      }
    });

    const list = Object.values(vendorMap).sort((a, b) => b.monthlyEstimate - a.monthlyEstimate);

    const mTotal = list.reduce((sum, v) => sum + v.monthlyEstimate, 0);
    const aTotal = mTotal * 12;

    const ai = list.filter((v) => v.category === "ai_apis").reduce((sum, v) => sum + v.monthlyEstimate, 0);
    const cloud = list.filter((v) => v.category === "cloud_infra").reduce((sum, v) => sum + v.monthlyEstimate, 0);
    const dev = list.filter((v) => v.category === "dev_tools").reduce((sum, v) => sum + v.monthlyEstimate, 0);

    return {
      vendorList: list,
      monthlyTotal: mTotal,
      annualRunRate: aTotal,
      aiTotal: ai,
      cloudTotal: cloud,
      devTotal: dev,
    };
  }, [bankTransactions]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai_apis":
        return <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case "cloud_infra":
        return <Cloud className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      case "dev_tools":
      default:
        return <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* SaaS Burn Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Monthly SaaS Burn
          </p>
          <p className="text-2xl font-black text-foreground mt-0.5">
            {formatCurrency(monthlyTotal)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </p>
          <span className="text-[10px] text-muted-foreground">Across {vendorList.length} active vendors</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Annualized Tech Run-Rate
          </p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            {formatCurrency(annualRunRate)}
            <span className="text-xs font-normal text-muted-foreground">/yr</span>
          </p>
          <span className="text-[10px] text-muted-foreground">Estimated infrastructure cost</span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 shadow-xs">
          <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
            AI & Model APIs
          </p>
          <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
            {formatCurrency(aiTotal)}
            <span className="text-xs font-normal text-indigo-600/70">/mo</span>
          </p>
          <span className="text-[10px] text-indigo-600/80">OpenAI, Anthropic & LLMs</span>
        </div>

        <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 shadow-xs">
          <p className="text-xs text-sky-700 dark:text-sky-300 font-semibold uppercase tracking-wider">
            Cloud, DB & Telephony
          </p>
          <p className="text-2xl font-black text-sky-700 dark:text-sky-300 mt-0.5">
            {formatCurrency(cloudTotal + devTotal)}
            <span className="text-xs font-normal text-sky-600/70">/mo</span>
          </p>
          <span className="text-[10px] text-sky-600/80">Vercel, AWS, Google, Twilio</span>
        </div>
      </div>

      {/* Detected Recurring Subscriptions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Detected Recurring Subscriptions & APIs
            </h3>
            <p className="text-xs text-muted-foreground">
              Automatically derived from your monthly business bank statement charges
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span>Zero Manual Entry</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorList.map((vendor) => (
            <div
              key={vendor.name}
              className="p-4 rounded-xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-muted border border-border">
                    {getCategoryIcon(vendor.category)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground tracking-tight">
                      {vendor.name}
                    </h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${vendor.categoryColor}`}>
                      {vendor.categoryLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-foreground">
                    {formatCurrency(vendor.monthlyEstimate)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    per month
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last: {new Date(vendor.lastChargedDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="font-semibold text-foreground">
                  YTD Spend: {formatCurrency(vendor.totalYtd)}
                </div>
              </div>
            </div>
          ))}

          {vendorList.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
              No recurring SaaS subscriptions detected yet. Upload a bank statement in the Bank Ledger tab to automatically populate vendor burn!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
