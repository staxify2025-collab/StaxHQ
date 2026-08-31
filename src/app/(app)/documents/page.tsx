"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Share2,
  Trash2,
  Filter,
  ExternalLink
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentUploaderModal } from "@/components/documents/DocumentUploaderModal";
import { SignatureCanvasModal } from "@/components/documents/SignatureCanvasModal";
import { downloadContractPdf, printContractPdf } from "@/lib/pdf/pdfGenerator";
import { formatDate } from "@/lib/utils";
import { ContractDocument } from "@/types/crm";

export default function DocumentsPage() {
  const { contracts, customers, activeOrg, deleteContract, updateContract } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [signingDoc, setSigningDoc] = useState<ContractDocument | null>(null);

  const filteredContracts = (contracts || []).filter((doc) => {
    const matchesSearch =
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" ? true : doc.type === selectedType;
    const matchesStatus = selectedStatus === "all" ? true : doc.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const signedCount = (contracts || []).filter((d) => d.status === "signed").length;
  const pendingCount = (contracts || []).filter((d) => d.status === "sent_for_signature").length;
  const draftCount = (contracts || []).filter((d) => d.status === "draft").length;

  const handleSignComplete = (
    docId: string,
    signatureData: NonNullable<ContractDocument["signatureData"]>
  ) => {
    updateContract(docId, {
      status: "signed",
      watermarkText: "SIGNED & EXECUTED",
      signatureData,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>Documents & Signed Contracts</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Central repository for client agreements, executed SLAs, digital signature workflows, and printable records.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          variant="gradient"
          className="gap-2 shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Signed & Executed
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{signedCount}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Legally binding files
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Out for Signature
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{pendingCount}</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                Pending client execution
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Drafts & Templates
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{draftCount}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Internal proposals & notes
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            {["all", "signed", "sent_for_signature", "draft"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedStatus === st
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "all" ? "All Status" : st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          >
            <option value="all">All Document Types</option>
            <option value="agreement">Master Agreements</option>
            <option value="sla">Service Level Agreements (SLAs)</option>
            <option value="proposal">Proposals / SOWs</option>
            <option value="nda">NDAs</option>
            <option value="invoice">Invoices</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title or customer..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredContracts.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-foreground">No documents found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Upload existing contracts or create a new agreement to start your repository.
            </p>
            <Button
              onClick={() => setIsUploadOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Document</span>
            </Button>
          </div>
        ) : (
          filteredContracts.map((doc) => {
            const customer = customers.find((c) => c.id === doc.customerId);
            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{doc.title}</h4>
                      <Badge
                        variant={doc.status === "signed" ? "success" : "secondary"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {doc.status.replace(/_/g, " ")}
                      </Badge>
                      {doc.watermarkText && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground">
                          {doc.watermarkText}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      Account:{" "}
                      {customer ? (
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {customer.name}
                        </Link>
                      ) : (
                        doc.customerName || "General"
                      )}{" "}
                      • Added {formatDate(doc.createdAt)}
                    </p>

                    {doc.signatureData?.signedAt && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full w-fit">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>
                          Signed by {doc.signatureData.signerName} ({formatDate(doc.signatureData.signedAt)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {doc.status !== "signed" && (
                    <Button
                      onClick={() => setSigningDoc(doc)}
                      size="sm"
                      variant="gradient"
                      className="gap-1.5 text-xs shadow-sm"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Sign Digitally</span>
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      const url = `${window.location.origin}/sign/${doc.id}`;
                      navigator.clipboard.writeText(url);
                      alert(`Public E-Signature Link copied:\n${url}`);
                    }}
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                    title="Share E-Sign Link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share Link</span>
                  </Button>

                  <Button
                    onClick={() =>
                      printContractPdf({
                        document: doc,
                        customer,
                        org: activeOrg,
                      })
                    }
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                    title="Print with Company Header"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </Button>

                  <Button
                    onClick={() =>
                      downloadContractPdf({
                        document: doc,
                        customer,
                        org: activeOrg,
                      })
                    }
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </Button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete document "${doc.title}"?`)) {
                        deleteContract(doc.id);
                      }
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DocumentUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <SignatureCanvasModal
        isOpen={!!signingDoc}
        onClose={() => setSigningDoc(null)}
        document={signingDoc}
        onSignComplete={handleSignComplete}
      />
    </div>
  );
}
