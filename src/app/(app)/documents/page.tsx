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
  ExternalLink,
  Sparkles,
  UploadCloud,
  Eye,
  Landmark,
  Building2,
  ScrollText,
  FileCheck2,
  Layers,
  FileSignature,
  FileSpreadsheet,
  Send
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentUploaderModal } from "@/components/documents/DocumentUploaderModal";
import { DocumentCreatorModal } from "@/components/documents/DocumentCreatorModal";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";
import { SignatureCanvasModal } from "@/components/documents/SignatureCanvasModal";
import { SendSignatureModal } from "@/components/documents/SendSignatureModal";
import { downloadContractPdf, printContractPdf } from "@/lib/pdf/pdfGenerator";
import { formatDate } from "@/lib/utils";
import { ContractDocument, DocumentScope, DocumentType } from "@/types/crm";

export default function DocumentsPage() {
  const { contracts, customers, activeOrg, deleteContract, updateContract } = useTenant();

  const [activeTab, setActiveTab] = useState<"all" | DocumentScope>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ContractDocument | null>(null);
  const [signingDoc, setSigningDoc] = useState<ContractDocument | null>(null);
  const [sendingDoc, setSendingDoc] = useState<ContractDocument | null>(null);

  const allContracts = contracts || [];

  // Filtered Documents
  const filteredContracts = allContracts.filter((doc) => {
    // 1. Tab Scope Filter
    if (activeTab !== "all") {
      const docScope = doc.scope || (doc.customerId ? "client_contract" : "company_vault");
      if (docScope !== activeTab) return false;
    }

    // 2. Search
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      doc.title?.toLowerCase().includes(searchLower) ||
      doc.customerName?.toLowerCase().includes(searchLower) ||
      doc.fileName?.toLowerCase().includes(searchLower) ||
      doc.type?.toLowerCase().includes(searchLower);

    // 3. Category Type
    const matchesType = selectedType === "all" ? true : doc.type === selectedType;

    // 4. Status
    const matchesStatus = selectedStatus === "all" ? true : doc.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI Counts
  const companyVaultCount = allContracts.filter(
    (d) => d.scope === "company_vault" || (!d.customerId && d.scope !== "template")
  ).length;
  const signedCount = allContracts.filter((d) => d.status === "signed").length;
  const pendingCount = allContracts.filter((d) => d.status === "sent_for_signature").length;
  const templateCount = allContracts.filter((d) => d.scope === "template").length;

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

  const getCategoryIcon = (type: DocumentType) => {
    switch (type) {
      case "tax_w9":
        return <Landmark className="h-5 w-5 text-indigo-500" />;
      case "llc_legal":
        return <Building2 className="h-5 w-5 text-purple-500" />;
      case "insurance":
        return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
      case "memo":
        return <ScrollText className="h-5 w-5 text-amber-500" />;
      case "nda":
        return <FileCheck2 className="h-5 w-5 text-cyan-500" />;
      case "agreement":
      case "sla":
      default:
        return <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <span>Document Hub & Resource Vault</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Central repository for corporate tax documents (W-9, LLC articles, COI), client contracts, standard templates, and instant letterhead generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => setIsUploadOpen(true)}
            variant="outline"
            className="gap-2 shadow-sm font-semibold text-xs h-9"
          >
            <UploadCloud className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Upload Document</span>
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="gradient"
            className="gap-2 shadow-md font-semibold text-xs h-9"
          >
            <Sparkles className="h-4 w-4" />
            <span>Create Letterhead Doc</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card hover:border-indigo-500/30 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Company & Tax Vault
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{companyVaultCount}</h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                W-9, LLC & COI records
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card hover:border-emerald-500/30 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Signed & Executed
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{signedCount}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Legally binding client files
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card hover:border-amber-500/30 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Out for Signature
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{pendingCount}</h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Pending client execution
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card hover:border-slate-500/30 transition-all shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Standard Templates
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{templateCount}</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Master MSA & NDA blanks
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
              <ScrollText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Navigation Tabs */}
      <div className="border-b border-border/80 flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { id: "all", label: "All Documents", count: allContracts.length },
          { id: "company_vault", label: "Company & Tax Vault (W-9, LLC, COI)", count: companyVaultCount },
          { id: "client_contract", label: "Client Contracts & SLAs", count: allContracts.filter((d) => d.scope === "client_contract" || d.customerId).length },
          { id: "template", label: "Standard Blank Templates", count: templateCount },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                isActive
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            {["all", "official_record", "signed", "sent_for_signature", "draft"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedStatus === st
                    ? "bg-card text-foreground shadow-sm font-bold"
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
            <option value="tax_w9">Form W-9 & Tax Info</option>
            <option value="llc_legal">LLC Legal Filings</option>
            <option value="insurance">Insurance (COI)</option>
            <option value="agreement">Master Agreements (MSAs)</option>
            <option value="sla">Service Level Agreements (SLAs)</option>
            <option value="proposal">Proposals / SOWs</option>
            <option value="nda">Non-Disclosure Agreements (NDAs)</option>
            <option value="memo">Executive Memos</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, tax ID, or client..."
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
              Upload existing contracts/W-9 forms or generate a new letterhead agreement to start your repository.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                onClick={() => setIsUploadOpen(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload Document</span>
              </Button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="gradient"
                size="sm"
                className="gap-1.5 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create Letterhead Doc</span>
              </Button>
            </div>
          </div>
        ) : (
          filteredContracts.map((doc) => {
            const customer = doc.customerId
              ? customers.find((c) => c.id === doc.customerId)
              : undefined;

            const isVault = doc.scope === "company_vault" || (!doc.customerId && doc.scope !== "template");
            const isTemplate = doc.scope === "template";

            return (
              <div
                key={doc.id}
                className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-sm hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                    {getCategoryIcon(doc.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                        {doc.title}
                      </h4>

                      {/* Scope Badge */}
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          isVault
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                            : isTemplate
                            ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200"
                        }`}
                      >
                        {isVault ? "Company Vault" : isTemplate ? "Template" : "Client Agreement"}
                      </Badge>

                      {/* Status Badge */}
                      <Badge
                        variant={
                          doc.status === "signed" || doc.status === "official_record"
                            ? "success"
                            : doc.status === "sent_for_signature"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {doc.status.replace(/_/g, " ")}
                      </Badge>

                      {/* Watermark Tag */}
                      {doc.watermarkText && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted/80 font-mono text-muted-foreground border border-border/60">
                          {doc.watermarkText}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {isVault ? (
                        <span className="font-semibold text-foreground">
                          🏛️ {activeOrg.name} Corporate Asset
                        </span>
                      ) : isTemplate ? (
                        <span className="font-semibold text-foreground">
                          📑 Blank Standard Template
                        </span>
                      ) : (
                        <>
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
                          )}
                        </>
                      )}{" "}
                      • Added {formatDate(doc.createdAt)} • Ref: {doc.fileName || `${doc.id}.pdf`}
                    </p>

                    {/* Signed info */}
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
                  {/* Preview Button */}
                  <Button
                    onClick={() => setPreviewDoc(doc)}
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                    title="Preview Document"
                  >
                    <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Preview</span>
                  </Button>

                  {/* 1-Click Print */}
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
                    title="Print with Company Letterhead"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </Button>

                  {/* Download PDF */}
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
                    title="Download PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </Button>

                  {/* Send for Signature if required and not signed */}
                  {doc.signatureRequired && doc.status !== "signed" && (
                    <Button
                      onClick={() => setSendingDoc(doc)}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs border-indigo-500/40 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      title="Send via Gmail from jeff@staxifytech.com"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send</span>
                    </Button>
                  )}

                  {/* Sign Digitally if required */}
                  {doc.signatureRequired && doc.status !== "signed" && (
                    <Button
                      onClick={() => setSigningDoc(doc)}
                      size="sm"
                      variant="gradient"
                      className="gap-1 text-xs shadow-sm"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Sign Digitally</span>
                    </Button>
                  )}

                  {/* Share Link if customer doc */}
                  {!isVault && (
                    <Button
                      onClick={() => {
                        const url = `${window.location.origin}/sign/${doc.id}`;
                        navigator.clipboard.writeText(url);
                        alert(`Public E-Signature Link copied:\n${url}`);
                      }}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs hidden sm:flex"
                      title="Share E-Sign Link"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </Button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`Delete document "${doc.title}"?`)) {
                        deleteContract(doc.id);
                      }
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <DocumentUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <DocumentCreatorModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onDocumentCreated={(createdDoc) => setPreviewDoc(createdDoc)}
        onSendForSignature={(createdDoc) => setSendingDoc(createdDoc)}
      />

      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        onSendForSignature={(doc) => setSendingDoc(doc)}
      />

      <SignatureCanvasModal
        isOpen={!!signingDoc}
        onClose={() => setSigningDoc(null)}
        document={signingDoc}
        onSignComplete={handleSignComplete}
      />

      <SendSignatureModal
        isOpen={!!sendingDoc}
        onClose={() => setSendingDoc(null)}
        document={sendingDoc}
      />
    </div>
  );
}
