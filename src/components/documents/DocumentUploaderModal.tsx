"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractDocument, DocumentType, DocumentStatus } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { UploadCloud, FileText, CheckCircle2, Shield } from "lucide-react";
import { appConfig } from "@/config/appConfig";

interface DocumentUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
}

export function DocumentUploaderModal({
  isOpen,
  onClose,
  defaultCustomerId,
}: DocumentUploaderModalProps) {
  const { customers, addContract, activeOrg } = useTenant();

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState(defaultCustomerId || customers[0]?.id || "");
  const [type, setType] = useState<DocumentType>("agreement");
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [watermark, setWatermark] = useState(appConfig.brand.defaultWatermark);
  const [signatureRequired, setSignatureRequired] = useState(true);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerId) return;

    const selectedCust = customers.find((c) => c.id === customerId);

    addContract({
      customerId,
      customerName: selectedCust?.name || "Client",
      title,
      type,
      status,
      fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
      fileSizeBytes: fileSize || 215000,
      watermarkText: watermark,
      signatureRequired,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-indigo-600" />
            <span>Upload or Register Contract Document</span>
          </DialogTitle>
          <DialogDescription>
            Attach contracts, SLAs, proposals, or signed agreements to customer records with watermarking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* File Dropzone */}
          <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors bg-muted/20">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center">
              <UploadCloud className="h-9 w-9 text-indigo-500 mb-2" />
              {fileName ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{fileName} ({(fileSize / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-foreground">
                    Click to upload or drag and drop PDF/DOCX
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Contracts, NDAs, and signed municipal agreements (up to 50MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="docTitle">Document Title *</Label>
              <Input
                id="docTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Services Agreement (MSA) - 2026"
                required
              />
            </div>

            <div>
              <Label htmlFor="custSelect">Associated Customer *</Label>
              <select
                id="custSelect"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="docType">Document Category</Label>
              <select
                id="docType"
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="agreement">Master Agreement / Contract</option>
                <option value="sla">Service Level Agreement (SLA)</option>
                <option value="proposal">Statement of Work (SOW) / Proposal</option>
                <option value="nda">Non-Disclosure Agreement (NDA)</option>
                <option value="invoice">Billing Invoice / Schedule</option>
                <option value="custom">Other Document</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Current Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="sent_for_signature">Sent for Signature</option>
                <option value="signed">Signed & Executed</option>
                <option value="expired">Archived / Expired</option>
              </select>
            </div>

            <div>
              <Label htmlFor="watermark">Watermark Stamp</Label>
              <select
                id="watermark"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {appConfig.brand.watermarkOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs">
            <input
              type="checkbox"
              id="sigReq"
              checked={signatureRequired}
              onChange={(e) => setSignatureRequired(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="sigReq" className="text-foreground font-medium cursor-pointer">
              Enable Digital E-Signature link for this document
            </label>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save to Repository
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
