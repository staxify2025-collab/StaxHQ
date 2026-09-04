"use client";

import React, { useState, useRef } from "react";
import { BankTransaction } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { parseBankCsv } from "@/lib/financials/bankParser";
import { initialBankTransactions } from "@/lib/demo/seedData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Plus,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BankStatementUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankStatementUploaderModal({
  isOpen,
  onClose,
}: BankStatementUploaderModalProps) {
  const { activeOrg, importBankTransactions, overwriteBankTransactions, sendNotification } = useTenant();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedTransactions, setParsedTransactions] = useState<BankTransaction[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [importMode, setImportMode] = useState<"replace" | "append">("replace");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg("");
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("File is empty.");

        const results = parseBankCsv(text, activeOrg.id, file.name);
        if (results.length === 0) {
          throw new Error("Could not find valid transaction lines. Please ensure CSV contains Date, Description, and Amount columns.");
        }
        setParsedTransactions(results);
        setIsProcessing(false);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to parse CSV file.");
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read file.");
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setFileName("sample-bank-statement.csv");
    setParsedTransactions(initialBankTransactions);
    setErrorMsg("");
  };

  const handleConfirmImport = () => {
    if (parsedTransactions.length === 0) return;

    if (importMode === "replace") {
      overwriteBankTransactions(parsedTransactions);
    } else {
      importBankTransactions(parsedTransactions);
    }
    setIsSuccess(true);

    const drawsCount = parsedTransactions.filter((tx) => tx.category === "owner_draw").length;
    const opexCount = parsedTransactions.filter((tx) => tx.category !== "owner_draw" && tx.type === "debit").length;

    sendNotification({
      recipientUserId: "all",
      type: "system",
      title: `📥 Bank Statement ${importMode === "replace" ? "Imported (Clean Slate)" : "Appended"}: ${fileName}`,
      messageSnippet: `${importMode === "replace" ? "Replaced ledger with" : "Appended"} ${parsedTransactions.length} transactions (${opexCount} OpEx, ${drawsCount} Owner Draws).`,
      targetUrl: "/financials",
    });

    setTimeout(() => {
      setIsSuccess(false);
      setParsedTransactions([]);
      setFileName("");
      onClose();
    }, 1200);
  };

  const totalInflow = parsedTransactions
    .filter((tx) => tx.type === "credit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = parsedTransactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOwnerDraws = parsedTransactions
    .filter((tx) => tx.category === "owner_draw")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Upload Bank Statement / CSV
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ingest monthly business bank transactions. Debits are automatically sorted as AI, Cloud, Dev Tools, or OpEx purchases.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Import Completed Successfully!
            </h3>
            <p className="text-xs text-muted-foreground">
              {parsedTransactions.length} bank transactions added to your operating ledger.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/40 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {fileName ? fileName : "Click or drag your bank CSV statement here"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Supports Chase, Mercury, Relay, Brex, BofA, Wells Fargo & custom bank CSVs
                </p>
              </div>

              {!fileName && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample();
                    }}
                    className="text-xs font-semibold gap-1.5 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span>Load Sample Bank Statement</span>
                  </Button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Parsed Preview Summary */}
            {parsedTransactions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Parsed Statement Summary ({parsedTransactions.length} Items)
                  </h4>
                  <span className="text-xs font-semibold text-emerald-600">
                    Auto-categorized & ready
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-card border border-border/80 text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Inflows (Deposits)</p>
                    <p className="text-sm font-extrabold text-emerald-600">{formatCurrency(totalInflow)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/80 text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Outflows</p>
                    <p className="text-sm font-extrabold text-rose-600">{formatCurrency(totalOutflow)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                    <p className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">Owner Draws</p>
                    <p className="text-sm font-extrabold text-purple-700 dark:text-purple-300">{formatCurrency(totalOwnerDraws)}</p>
                  </div>
                </div>

                {/* Import Mode Selector */}
                <div className="bg-muted/40 p-3 rounded-xl border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Import Action</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Choose how to handle your ledger</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode("replace")}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        importMode === "replace"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs"
                          : "border-border/70 hover:bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <RefreshCw className={`h-3.5 w-3.5 ${importMode === "replace" ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                        <span>Replace Existing (Clean Slate)</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                        Wipes current ledger and sets this statement as the new source of truth.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode("append")}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        importMode === "append"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border/70 hover:bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Plus className={`h-3.5 w-3.5 ${importMode === "append" ? "text-primary" : ""}`} />
                        <span>Append to Existing</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                        Preserves current ledger items and adds these new transactions on top.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Top 5 Preview Rows */}
                <div className="border border-border/70 rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto divide-y divide-border/60">
                  {parsedTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="p-2.5 flex items-center justify-between bg-card/50">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-foreground truncate">{tx.payeeClean}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{tx.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-extrabold ${tx.type === "credit" ? "text-emerald-600" : "text-foreground"}`}>
                          {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-semibold">
                          {tx.category.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>

          {parsedTransactions.length > 0 && !isSuccess && (
            <Button
              type="button"
              onClick={handleConfirmImport}
              className="text-xs font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/25 gap-1.5"
            >
              <span>Import {parsedTransactions.length} Transactions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
