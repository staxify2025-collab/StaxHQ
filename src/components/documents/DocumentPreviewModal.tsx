"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContractDocument } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import {
  Printer,
  Download,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Tag,
  ExternalLink,
  Layers,
  Send
} from "lucide-react";
import {
  getDocumentPdfBlobUrl,
  downloadContractPdf,
  printContractPdf,
} from "@/lib/pdf/pdfGenerator";
import { formatDate } from "@/lib/utils";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ContractDocument | null;
  onSendForSignature?: (doc: ContractDocument) => void;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  onSendForSignature,
}: DocumentPreviewModalProps) {
  const { customers, activeOrg } = useTenant();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const customer = document?.customerId
    ? customers.find((c) => c.id === document.customerId)
    : undefined;

  useEffect(() => {
    if (isOpen && document) {
      setLoading(true);
      try {
        const url = getDocumentPdfBlobUrl({
          document,
          customer,
          org: activeOrg,
        });
        setBlobUrl(url);
      } catch (err) {
        console.error("Error generating preview blob:", err);
      } finally {
        setLoading(false);
      }
    } else {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
    // Cleanup blob url on unmount/close
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, document, customer, activeOrg]);

  if (!document) return null;

  const handlePrint = () => {
    printContractPdf({
      document,
      customer,
      org: activeOrg,
    });
  };

  const handleDownload = () => {
    downloadContractPdf({
      document,
      customer,
      org: activeOrg,
    });
  };

  const scopeLabel =
    document.scope === "company_vault"
      ? "Company & Tax Vault"
      : document.scope === "template"
      ? "Standard Template"
      : "Client Agreement";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border/80 bg-muted/20 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3 pr-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground line-clamp-1">
                {document.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {scopeLabel}
                </Badge>
                <Badge
                  variant={document.status === "signed" || document.status === "official_record" ? "success" : "secondary"}
                  className="text-[10px] uppercase font-bold"
                >
                  {document.status.replace(/_/g, " ")}
                </Badge>
                {document.watermarkText && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-mono text-muted-foreground">
                    WATERMARK: {document.watermarkText}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {document.signatureRequired && document.status !== "signed" && onSendForSignature && (
              <Button
                onClick={() => {
                  onClose();
                  onSendForSignature(document);
                }}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs shadow-sm font-semibold border-indigo-500/40 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Send for Signature</span>
                <span className="sm:hidden">Send</span>
              </Button>
            )}

            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs shadow-sm font-semibold"
            >
              <Printer className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Print Document</span>
              <span className="sm:hidden">Print</span>
            </Button>
            <Button
              onClick={handleDownload}
              variant="gradient"
              size="sm"
              className="gap-1.5 text-xs shadow-sm font-semibold"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Body: Split between Live PDF iframe and details panel */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[480px]">
          {/* PDF Viewer / Preview Canvas */}
          <div className="lg:col-span-2 bg-slate-900/90 dark:bg-black/90 p-2 sm:p-4 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border/80">
            {loading ? (
              <div className="text-center text-slate-400 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3" />
                <p className="text-xs">Rendering Document Preview...</p>
              </div>
            ) : blobUrl ? (
              <iframe
                src={`${blobUrl}#toolbar=0&navpanes=0`}
                title={document.title}
                className="w-full h-full min-h-[420px] rounded-lg border border-slate-700 bg-white shadow-lg"
              />
            ) : (
              <div className="text-center text-slate-400 py-12">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Preview unavailable for this file format.</p>
              </div>
            )}
          </div>

          {/* Metadata Inspector Sidebar */}
          <div className="p-5 bg-card overflow-y-auto space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-2 text-muted-foreground">
                Document Details
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-start justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Category:
                  </span>
                  <span className="font-semibold text-foreground capitalize">
                    {document.type.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Associated With:
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {customer ? customer.name : "Company Central Vault"}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Date Added:
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatDate(document.createdAt)}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> File Reference:
                  </span>
                  <span className="font-mono text-[11px] text-foreground max-w-[150px] truncate" title={document.fileName || document.id}>
                    {document.fileName || `${document.id}.pdf`}
                  </span>
                </div>
              </div>
            </div>

            {/* Letterhead & Security Info */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <h5 className="font-bold text-foreground text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Branding & Header Security</span>
              </h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Rendered with official {activeOrg.name} company letterhead, tax reference, and authenticated watermark stamp.
              </p>
            </div>

            {/* Signature Audit Log */}
            {document.signatureData?.signedAt && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Digital Signature Verified</span>
                </div>
                <p className="text-[11px] text-foreground">
                  Signer: <span className="font-semibold">{document.signatureData.signerName}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Email: {document.signatureData.signerEmail}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Audit Key: {document.signatureData.auditLogId}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-3 border-t border-border/80 bg-muted/20 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Staxify Document Hub • 1-Click Print & Export Engine
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
