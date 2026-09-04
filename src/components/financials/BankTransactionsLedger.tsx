"use client";

import React, { useState, useMemo } from "react";
import { BankTransaction, ExpenseCategory, TransactionType } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { categorizeBankDescription } from "@/lib/financials/bankParser";
import { 
  Upload, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  User, 
  DollarSign, 
  ArrowUpDown,
  RefreshCw,
  Tag,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BankTransactionsLedgerProps {
  onOpenUploader: () => void;
}

const CATEGORIES: { id: ExpenseCategory; label: string; color: string }[] = [
  { id: "ai_apis", label: "🤖 AI & APIs", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" },
  { id: "cloud_infra", label: "☁️ Cloud & Infrastructure", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30" },
  { id: "dev_tools", label: "🛠️ Software & Dev Tools", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  { id: "legal_admin", label: "⚖️ Legal, Taxes & Fees", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  { id: "contractors", label: "💼 Contractors & Payroll", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30" },
  { id: "office_travel", label: "🏢 Office & Travel", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30" },
  { id: "revenue_inflow", label: "💰 Revenue Deposit / Inflow", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  { id: "other", label: "🏷️ Other Purchases / OpEx", color: "bg-muted text-muted-foreground border-border" },
  { id: "owner_draw", label: "💵 Owner Draw / Distribution", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30" },
];

export function BankTransactionsLedger({ onOpenUploader }: BankTransactionsLedgerProps) {
  const { 
    bankTransactions, 
    updateBankTransaction, 
    deleteBankTransaction, 
    addBankTransaction,
    overwriteBankTransactions,
    clearBankTransactions,
    sendNotification,
    teamMembers,
    currentUser 
  } = useTenant();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [visibleLimit, setVisibleLimit] = useState<number>(10);

  // Manual Transaction Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [manualPayee, setManualPayee] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualType, setManualType] = useState<TransactionType>("debit");
  const [manualCategory, setManualCategory] = useState<ExpenseCategory>("ai_apis");
  const [manualPartner, setManualPartner] = useState("JOSH");

  const handleRecategorizeAll = () => {
    if (!bankTransactions || bankTransactions.length === 0) return;
    const updated = bankTransactions.map((tx) => {
      const { category, payeeClean, partnerName, isRecurring } = categorizeBankDescription(
        tx.description,
        tx.type === "credit"
      );
      return {
        ...tx,
        category,
        payeeClean,
        partnerName,
        isRecurring: isRecurring ?? tx.isRecurring,
      };
    });
    overwriteBankTransactions(updated);
    sendNotification({
      recipientUserId: "all",
      type: "system",
      title: "⚡ Transactions Re-Categorized",
      messageSnippet: `Auto-categorized ${updated.length} transactions as verified purchases / OpEx.`,
      targetUrl: "/financials",
    });
  };

  const filteredTransactions = useMemo(() => {
    return (bankTransactions || []).filter((tx) => {
      const q = searchQuery.toLowerCase();
      const descMatch = tx.description?.toLowerCase().includes(q) ?? false;
      const payeeMatch = tx.payeeClean?.toLowerCase().includes(q) ?? false;
      const memoMatch = tx.memo?.toLowerCase().includes(q) ?? false;
      const partnerMatch = tx.partnerName?.toLowerCase().includes(q) ?? false;

      const matchesSearch = !q || descMatch || payeeMatch || memoMatch || partnerMatch;
      const matchesCategory = selectedCategory === "all" || tx.category === selectedCategory;
      const matchesType = selectedType === "all" || tx.type === selectedType;
      const matchesPartner =
        selectedPartner === "all" ||
        (tx.partnerName && tx.partnerName.toLowerCase() === selectedPartner.toLowerCase());

      return matchesSearch && matchesCategory && matchesType && matchesPartner;
    });
  }, [bankTransactions, searchQuery, selectedCategory, selectedType, selectedPartner]);

  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, visibleLimit);
  }, [filteredTransactions, visibleLimit]);

  // Financial Metrics
  const totalInflow = (bankTransactions || [])
    .filter((tx) => tx.type === "credit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOwnerDraws = (bankTransactions || [])
    .filter((tx) => tx.category === "owner_draw")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOpEx = (bankTransactions || [])
    .filter((tx) => tx.type === "debit" && tx.category !== "owner_draw")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netRetainedCash = totalInflow - totalOpEx - totalOwnerDraws;

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(manualAmount);
    if (!manualPayee.trim() || isNaN(parsedAmt) || parsedAmt <= 0) return;

    addBankTransaction({
      date: Date.now(),
      description: manualDesc.trim() || manualPayee.trim(),
      payeeClean: manualPayee.trim(),
      amount: parsedAmt,
      type: manualType,
      category: manualCategory,
      partnerName: manualCategory === "owner_draw" ? manualPartner : undefined,
      memo: manualDesc.trim() || undefined,
      sourceFile: "Manual Entry",
    });

    setManualPayee("");
    setManualDesc("");
    setManualAmount("");
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Total Inflows (Deposits)
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(totalInflow)}
          </p>
          <span className="text-[10px] text-muted-foreground">Revenue & Client ACH</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Operating Expenses (OpEx)
          </p>
          <p className="text-2xl font-black text-foreground mt-0.5">
            {formatCurrency(totalOpEx)}
          </p>
          <span className="text-[10px] text-muted-foreground">SaaS, Cloud & Admin</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 shadow-xs">
          <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wider">
            Total Owner Draws
          </p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
            {formatCurrency(totalOwnerDraws)}
          </p>
          <span className="text-[10px] text-purple-600/80">Partner Distributions YTD</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Net Free Cash Flow
          </p>
          <p className={`text-2xl font-black mt-0.5 ${netRetainedCash >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {formatCurrency(netRetainedCash)}
          </p>
          <span className="text-[10px] text-muted-foreground">After Expenses & Draws</span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        {/* Left Search */}
        <div className="relative min-w-[220px] flex-1 lg:max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions, payee, memo, partner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8.5 h-8.5 text-xs bg-background"
          />
        </div>

        {/* Right Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap flex-1 lg:justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className="h-8.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Partners</option>
            <option value="JOSH">JOSH</option>
            <option value="Admin Operator">Admin Operator</option>
          </select>

          {bankTransactions && bankTransactions.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRecategorizeAll}
                className="h-8.5 text-xs font-bold gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                title="Re-run AI & OpEx smart pattern matcher across all transactions in this ledger"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Auto-Categorize All</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsClearDialogOpen(true)}
                className="h-8.5 text-xs font-bold gap-1 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Wipe current bank transactions to start with a blank ledger"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                <span>Clear All</span>
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="h-8.5 text-xs font-bold gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manual Entry</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onOpenUploader}
            className="h-8.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Statement</span>
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-bold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payee / Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Partner Assignee</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {displayedTransactions.map((tx) => {
                const catObj = CATEGORIES.find((c) => c.id === tx.category) || CATEGORIES[CATEGORIES.length - 1];

                return (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{tx.payeeClean}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">
                        {tx.description}
                      </div>
                      {tx.memo && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium italic mt-0.5">
                          Memo: {tx.memo}
                        </div>
                      )}
                    </td>

                    {/* Inline Category Switcher */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={tx.category}
                        onChange={(e) => {
                          const newCat = e.target.value as ExpenseCategory;
                          updateBankTransaction(tx.id, { 
                            category: newCat,
                            partnerName: newCat === "owner_draw" ? (tx.partnerName || "JOSH") : undefined
                          });
                        }}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${catObj.color}`}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id} className="bg-popover text-popover-foreground">
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Partner Assignment for Owner Draws */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.category === "owner_draw" ? (
                        <select
                          value={tx.partnerName || "JOSH"}
                          onChange={(e) => updateBankTransaction(tx.id, { partnerName: e.target.value })}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 focus:outline-none"
                        >
                          <option value="JOSH">Partner: JOSH</option>
                          <option value="Admin Operator">Partner: Admin Operator</option>
                          <option value="Split 50/50">Split 50/50</option>
                        </select>
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`font-black text-sm ${
                        tx.type === "credit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.category === "owner_draw"
                          ? "text-purple-700 dark:text-purple-300"
                          : "text-foreground"
                      }`}>
                        {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBankTransaction(tx.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <p className="text-xs">No bank transactions found matching your criteria.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onOpenUploader}
                      className="mt-3 text-xs font-semibold"
                    >
                      Upload Bank CSV
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 10-Item Pagination & Expand Footer */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/20 border-t border-border/80 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-medium flex-wrap">
              <span>
                Showing <strong className="text-foreground font-bold">{Math.min(visibleLimit, filteredTransactions.length)}</strong> of <strong className="text-foreground font-bold">{filteredTransactions.length}</strong> transactions
              </span>

              <div className="flex items-center gap-1.5 ml-1 border-l border-border/80 pl-2.5">
                <span className="text-[11px] text-muted-foreground">Display:</span>
                <select
                  value={visibleLimit >= filteredTransactions.length ? "all" : visibleLimit.toString()}
                  onChange={(e) => {
                    if (e.target.value === "all") {
                      setVisibleLimit(filteredTransactions.length);
                    } else {
                      setVisibleLimit(Number(e.target.value));
                    }
                  }}
                  className="h-6.5 rounded-md border border-input bg-background px-2 text-[11px] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="all">Show All ({filteredTransactions.length})</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {visibleLimit < filteredTransactions.length ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleLimit((prev) => prev + 10)}
                  className="h-7 text-xs font-bold gap-1 text-primary hover:bg-primary/10 border-primary/30"
                >
                  <span>Show 10 More</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              ) : filteredTransactions.length > 10 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisibleLimit(10)}
                  className="h-7 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                >
                  <span>Collapse to 10</span>
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateManual} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Add Manual Bank Entry
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record a direct owner distribution, cash expense, or manual bank adjustment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Payee / Recipient <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Josh Norris (Draw) or Best Buy"
                  value={manualPayee}
                  onChange={(e) => setManualPayee(e.target.value)}
                  required
                  className="text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Amount ($) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    required
                    className="text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Type
                  </label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value as TransactionType)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium"
                  >
                    <option value="debit">Debit (Outflow)</option>
                    <option value="credit">Credit (Deposit)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Category
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {manualCategory === "owner_draw" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Partner Recipient
                  </label>
                  <select
                    value={manualPartner}
                    onChange={(e) => setManualPartner(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-bold text-purple-700"
                  >
                    <option value="JOSH">JOSH</option>
                    <option value="Admin Operator">Admin Operator</option>
                    <option value="Split 50/50">Split 50/50</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Memo / Note
                </label>
                <Input
                  placeholder="e.g. August profit distribution"
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManualModalOpen(false)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-xs font-bold bg-primary text-primary-foreground"
              >
                Record Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Clear All Bank Transactions?</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  This will permanently wipe all {bankTransactions?.length || 0} transactions from your ledger.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed">
            You will have a completely clean slate and can upload a new CSV bank statement at any time.
          </p>

          <DialogFooter className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearDialogOpen(false)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                clearBankTransactions();
                setIsClearDialogOpen(false);
                sendNotification({
                  recipientUserId: "all",
                  type: "system",
                  title: "🗑️ Bank Ledger Cleared",
                  messageSnippet: "All bank transactions have been wiped. Ready for fresh CSV import.",
                  targetUrl: "/financials",
                });
              }}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Yes, Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
