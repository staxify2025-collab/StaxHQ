"use client";

import React, { useMemo, useState } from "react";
import { BankTransaction } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportTaxReportPdf, exportTaxReportCsv } from "@/lib/financials/taxReportGenerator";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PartnerDrawsAndPnL() {
  const { bankTransactions, activeOrg } = useTenant();
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>("all");

  const {
    totalInflows,
    totalOpEx,
    totalOwnerDraws,
    netRetained,
    partnerDrawMap,
    categoryBreakdown,
    ownerDrawList,
    drawParityPercentage,
  } = useMemo(() => {
    let inflows = 0;
    let opex = 0;
    let draws = 0;
    const catMap: { [cat: string]: number } = {};
    const pMap: { [partner: string]: number } = {
      JOSH: 0,
      "Admin Operator": 0,
    };
    const drawTxs: BankTransaction[] = [];

    (bankTransactions || []).forEach((tx) => {
      if (tx.type === "credit") {
        inflows += tx.amount;
        catMap.revenue_inflow = (catMap.revenue_inflow || 0) + tx.amount;
      } else {
        if (tx.category === "owner_draw") {
          draws += tx.amount;
          drawTxs.push(tx);
          const pName = tx.partnerName || "JOSH";
          pMap[pName] = (pMap[pName] || 0) + tx.amount;
        } else {
          opex += tx.amount;
          catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
        }
      }
    });

    const net = inflows - opex - draws;

    const joshTotal = pMap["JOSH"] || 0;
    const adminTotal = pMap["Admin Operator"] || 0;
    const combinedTotal = joshTotal + adminTotal;
    const parity = combinedTotal > 0 ? Math.round((joshTotal / combinedTotal) * 100) : 50;

    return {
      totalInflows: inflows,
      totalOpEx: opex,
      totalOwnerDraws: draws,
      netRetained: net,
      partnerDrawMap: pMap,
      categoryBreakdown: catMap,
      ownerDrawList: drawTxs.sort((a, b) => b.date - a.date),
      drawParityPercentage: parity,
    };
  }, [bankTransactions]);

  const currentYear = new Date().getFullYear();

  const handleExportPdf = () => {
    exportTaxReportPdf({
      org: activeOrg,
      year: currentYear,
      totalInflows,
      totalOpEx,
      totalOwnerDraws,
      netRetained,
      categoryBreakdown,
      partnerDraws: partnerDrawMap,
      transactions: bankTransactions,
    });
  };

  const handleExportCsv = () => {
    exportTaxReportCsv({
      year: currentYear,
      totalInflows,
      totalOpEx,
      totalOwnerDraws,
      netRetained,
      categoryBreakdown,
      partnerDraws: partnerDrawMap,
      transactions: bankTransactions,
    });
  };

  const filteredDraws = useMemo(() => {
    if (selectedPartnerFilter === "all") return ownerDrawList;
    return ownerDrawList.filter(
      (tx) => (tx.partnerName || "JOSH").toLowerCase() === selectedPartnerFilter.toLowerCase()
    );
  }, [ownerDrawList, selectedPartnerFilter]);

  return (
    <div className="space-y-6">
      {/* Action Header & Tax Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/10 to-slate-900/20 border border-purple-500/20 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>Partner Equity Draws & Tax P&L Engine</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Transparent founder distribution ledger and CPA-formatted annual P&L statement
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs font-bold gap-1.5 border-border hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Tax CSV</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleExportPdf}
            className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/25 gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Download CPA Tax PDF</span>
          </Button>
        </div>
      </div>

      {/* Partner Draw Distribution Cards & Parity Meter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Founder & Partner Distributions ({currentYear} YTD)
          </h4>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            Total Distributed: {formatCurrency(totalOwnerDraws)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Partner 1: JOSH */}
          <div className="p-5 rounded-2xl bg-card border border-purple-500/30 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  JO
                </div>
                <div>
                  <h4 className="font-black text-base text-foreground tracking-tight">
                    Josh Norris
                  </h4>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Partner / Co-Founder
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-purple-700 dark:text-purple-300">
                  {formatCurrency(partnerDrawMap["JOSH"] || 0)}
                </span>
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                  YTD Draws Taken
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {ownerDrawList.filter((tx) => (tx.partnerName || "JOSH") === "JOSH").length} Distributions
              </span>
              <span className="font-semibold text-foreground">
                Target Share: 50.0%
              </span>
            </div>
          </div>

          {/* Partner 2: Admin Operator / Partner */}
          <div className="p-5 rounded-2xl bg-card border border-indigo-500/30 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  AO
                </div>
                <div>
                  <h4 className="font-black text-base text-foreground tracking-tight">
                    Admin Operator
                  </h4>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Partner / Co-Founder
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                  {formatCurrency(partnerDrawMap["Admin Operator"] || 0)}
                </span>
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                  YTD Draws Taken
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {ownerDrawList.filter((tx) => tx.partnerName === "Admin Operator").length} Distributions
              </span>
              <span className="font-semibold text-foreground">
                Target Share: 50.0%
              </span>
            </div>
          </div>
        </div>

        {/* 50/50 Equity Parity Meter */}
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-purple-600" />
              <span>Partner Distribution Parity Check (50 / 50 Split)</span>
            </span>
            <span className="font-bold text-purple-700 dark:text-purple-300">
              Josh: {drawParityPercentage}% | Admin: {100 - drawParityPercentage}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-indigo-500/30 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${drawParityPercentage}%` }}
              title={`Josh: ${drawParityPercentage}%`}
            />
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${100 - drawParityPercentage}%` }}
              title={`Admin: ${100 - drawParityPercentage}%`}
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            {drawParityPercentage === 50
              ? "✓ Distributions are perfectly symmetrical (50.0% / 50.0%)."
              : `Distributions variance: ${Math.abs(drawParityPercentage - 50) * 2}% disparity.`}
          </p>
        </div>
      </div>

      {/* Executive P&L Breakdown Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Operating Profit & Loss (P&L) Ledger
        </h4>

        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-border/60 text-xs">
          {/* Revenue */}
          <div className="p-4 flex items-center justify-between bg-emerald-500/5">
            <div>
              <p className="font-bold text-foreground text-sm">
                Gross Realized Revenue (Deposits & Invoices)
              </p>
              <p className="text-muted-foreground text-[10px]">
                Paid municipal contracts and accounts receivable
              </p>
            </div>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalInflows)}
            </p>
          </div>

          {/* OpEx Breakdown */}
          <div className="p-4 space-y-2.5 bg-card">
            <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
              Operating Expenses (OpEx)
            </p>
            <div className="space-y-1.5 pl-2 border-l-2 border-border/80">
              <div className="flex items-center justify-between">
                <span>AI & Model APIs (OpenAI, Anthropic)</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(categoryBreakdown.ai_apis || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cloud & Infrastructure (Vercel, AWS, Twilio)</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(categoryBreakdown.cloud_infra || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Developer Software & Subscriptions (GitHub, Cursor, Google)</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(categoryBreakdown.dev_tools || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Legal, Filing & Bank Service Charges</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(categoryBreakdown.legal_admin || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Contractor Labor & External Dev</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(categoryBreakdown.contractors || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Operating Income Subtotal */}
          <div className="p-4 flex items-center justify-between bg-muted/40">
            <div>
              <p className="font-bold text-foreground text-xs">
                Net Operating Income (Gross Profit)
              </p>
              <p className="text-muted-foreground text-[10px]">
                Revenue minus Operating Expenses before Partner Draws
              </p>
            </div>
            <p className="text-sm font-extrabold text-foreground">
              {formatCurrency(totalInflows - totalOpEx)}
            </p>
          </div>

          {/* Owner Draws */}
          <div className="p-4 flex items-center justify-between bg-purple-500/5">
            <div>
              <p className="font-bold text-purple-700 dark:text-purple-300 text-sm">
                Less: Total Partner Equity Draws & Distributions
              </p>
              <p className="text-purple-600/70 text-[10px]">
                Founder equity distributions taken YTD
              </p>
            </div>
            <p className="text-base font-black text-purple-700 dark:text-purple-300">
              -{formatCurrency(totalOwnerDraws)}
            </p>
          </div>

          {/* Net Retained Cash */}
          <div className="p-4 flex items-center justify-between bg-card">
            <div>
              <p className="font-black text-foreground text-sm">
                Net Retained Operating Cash
              </p>
              <p className="text-muted-foreground text-[10px]">
                Available capital remaining in business bank reserves
              </p>
            </div>
            <p className={`text-lg font-black ${netRetained >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(netRetained)}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Partner Draw Transaction Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Historical Partner Distribution Log
          </h4>

          <select
            value={selectedPartnerFilter}
            onChange={(e) => setSelectedPartnerFilter(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium"
          >
            <option value="all">All Partners</option>
            <option value="JOSH">Josh Norris</option>
            <option value="Admin Operator">Admin Operator</option>
          </select>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-border/60 text-xs">
          {filteredDraws.map((tx) => (
            <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-600/10 text-purple-700 font-black text-[10px] flex items-center justify-center">
                  {(tx.partnerName || "JOSH").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {tx.partnerName || "JOSH"} — {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} • {tx.memo || tx.description}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  Owner Draw
                </span>
              </div>
            </div>
          ))}

          {filteredDraws.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No partner draws recorded for this selection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
