"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractDocument, DocumentType, DocumentStatus, DocumentScope } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { UploadCloud, CheckCircle2, ShieldCheck, Building2, Landmark, FileText } from "lucide-react";
import { appConfig } from "@/config/appConfig";

interface DocumentUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  defaultScope?: DocumentScope;
}

export function DocumentUploaderModal({
  isOpen,
  onClose,
  defaultCustomerId,
  defaultScope,
}: DocumentUploaderModalProps) {
  const { customers, addContract, activeOrg } = useTenant();

  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<DocumentScope>(defaultScope || "client_contract");
  const [customerId, setCustomerId] = useState(defaultCustomerId || customers[0]?.id || "");
  const [type, setType] = useState<DocumentType>("agreement");
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [watermark, setWatermark] = useState<string>("NONE");
  const [signatureRequired, setSignatureRequired] = useState(true);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [notes, setNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      }
    }
  };

  const handleScopeChange = (newScope: DocumentScope) => {
    setScope(newScope);
    if (newScope === "company_vault") {
      setType("tax_w9");
      setStatus("official_record");
      setWatermark("ORIGINAL RECORD");
      setSignatureRequired(false);
    } else if (newScope === "template") {
      setType("agreement");
      setStatus("draft");
      setWatermark("STANDARD TEMPLATE");
      setSignatureRequired(true);
    } else {
      setType("agreement");
      setStatus("draft");
      setWatermark("CONFIDENTIAL");
      setSignatureRequired(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCust = scope === "client_contract" && customerId
      ? customers.find((c) => c.id === customerId)
      : undefined;

    addContract({
      scope,
      customerId: selectedCust?.id,
      customerName: selectedCust?.name,
      title,
      type,
      status,
      fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
      fileSizeBytes: fileSize || 245000,
      watermarkText: watermark === "NONE" ? undefined : watermark,
      signatureRequired,
      contentHtml: notes,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-5 border-b border-border/80 bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UploadCloud className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Upload to Document Hub & Vault</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Upload LLC documents, Form W-9, insurance certificates, blank templates, or client agreements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Scope Selector Pills */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Document Target Vault
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleScopeChange("company_vault")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  scope === "company_vault"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                    : "border-border/80 bg-card hover:bg-muted/30 text-muted-foreground text-xs"
                }`}
              >
                <Landmark className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                <span className="text-xs">Company Vault</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeChange("client_contract")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  scope === "client_contract"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                    : "border-border/80 bg-card hover:bg-muted/30 text-muted-foreground text-xs"
                }`}
              >
                <Building2 className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                <span className="text-xs">Client Contract</span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeChange("template")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  scope === "template"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                    : "border-border/80 bg-card hover:bg-muted/30 text-muted-foreground text-xs"
                }`}
              >
                <FileText className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <span className="text-xs">Standard Template</span>
              </button>
            </div>
          </div>

          {/* File Dropzone */}
          <div className="relative border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-indigo-500/50 transition-colors bg-muted/20">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.png,.jpg"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center">
              <UploadCloud className="h-8 w-8 text-indigo-500 mb-2" />
              {fileName ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{fileName} ({(fileSize / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-foreground">
                    Click to upload or drag & drop PDF, Word, or Scanned Image
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    W-9 forms, LLC articles, COI certificates, or signed client PDFs (up to 50MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="md:col-span-2">
              <Label htmlFor="docTitle" className="text-xs">Document Title *</Label>
              <Input
                id="docTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Official Form W-9 (2026)"
                className="mt-1 text-xs"
                required
              />
            </div>

            {scope === "client_contract" && (
              <div className="md:col-span-2">
                <Label htmlFor="custSelect" className="text-xs">Associated Customer *</Label>
                <select
                  id="custSelect"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="docType" className="text-xs">Category</Label>
              <select
                id="docType"
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              >
                {scope === "company_vault" ? (
                  <>
                    <option value="tax_w9">Form W-9 & Tax Documentation</option>
                    <option value="llc_legal">LLC Certificate of Formation</option>
                    <option value="insurance">Certificate of Insurance (COI)</option>
                    <option value="agreement">Company Master Policy</option>
                    <option value="custom">Other Company Record</option>
                  </>
                ) : (
                  <>
                    <option value="agreement">Master Services Agreement (MSA)</option>
                    <option value="sla">Service Level Agreement (SLA)</option>
                    <option value="proposal">Statement of Work (SOW) / Proposal</option>
                    <option value="nda">Non-Disclosure Agreement (NDA)</option>
                    <option value="invoice">Billing Invoice / Schedule</option>
                    <option value="memo">Executive Memo</option>
                    <option value="custom">Other Contract</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="status" className="text-xs">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              >
                <option value="official_record">Official Record / Active</option>
                <option value="signed">Signed & Executed</option>
                <option value="sent_for_signature">Sent for Signature</option>
                <option value="draft">Draft / Internal</option>
                <option value="expired">Archived / Expired</option>
              </select>
            </div>

            <div>
              <Label htmlFor="watermark" className="text-xs">Watermark Stamp</Label>
              <select
                id="watermark"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm font-medium"
              >
                <option value="NONE">No Watermark</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="DRAFT">DRAFT</option>
                <option value="FOR REVIEW ONLY">FOR REVIEW ONLY</option>
                <option value="INTERNAL USE ONLY">INTERNAL USE ONLY</option>
                <option value="STAXIFY">STAXIFY (Brand Logo & Layered Mesh)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="sigReq"
                checked={signatureRequired}
                onChange={(e) => setSignatureRequired(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="sigReq" className="text-xs text-foreground font-medium cursor-pointer">
                Enable Digital E-Signature
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="docNotes" className="text-xs">Notes / Summary (Optional)</Label>
            <textarea
              id="docNotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add key notes regarding this document..."
              className="w-full p-2.5 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm" className="gap-1.5 shadow-md">
              <UploadCloud className="h-4 w-4" />
              <span>Save to Document Hub</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
