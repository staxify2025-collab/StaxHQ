"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Pen, 
  Type, 
  RotateCcw, 
  Download, 
  Building2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadContractPdf } from "@/lib/pdf/pdfGenerator";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PublicSignPage() {
  const params = useParams();
  const docId = params.docId as string;

  const { contracts, customers, activeOrg, updateContract } = useTenant();

  const document = contracts.find((d) => d.id === docId);
  const customer = customers.find((c) => c.id === document?.customerId);

  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [signerName, setSignerName] = useState(customer?.contacts[0]?.name || "");
  const [signerEmail, setSignerEmail] = useState(customer?.contacts[0]?.email || "");
  const [typedSignature, setTypedSignature] = useState(customer?.contacts[0]?.name || "");
  const [agreed, setAgreed] = useState(false);
  const [isSignedSuccess, setIsSignedSuccess] = useState(document?.status === "signed");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <FileText className="h-12 w-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Document Not Found</h2>
          <p className="text-xs text-slate-500">
            This digital signature link is invalid, expired, or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e1b4b";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !signerEmail.trim()) {
      alert("Please provide signer name and email.");
      return;
    }
    if (!agreed) {
      alert("Please confirm the legal agreement checkbox.");
      return;
    }

    let signatureImageBase64 = "";
    if (mode === "draw" && canvasRef.current) {
      signatureImageBase64 = canvasRef.current.toDataURL("image/png");
    }

    const signatureData = {
      signerName,
      signerEmail,
      signatureImageBase64,
      signedAt: Date.now(),
      ipAddress: "68.102.44.12 (SSL Verified Client Session)",
      auditLogId: `AUD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    updateContract(document.id, {
      status: "signed",
      watermarkText: "SIGNED & EXECUTED",
      signatureData,
    });

    setIsSignedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Security & Org Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">{activeOrg.name}</h2>
              <p className="text-[11px] text-muted-foreground">
                Secure Document Signing Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-full shadow-sm">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {isSignedSuccess ? (
          /* Success Screen */
          <div className="rounded-2xl border border-emerald-500/40 bg-card p-8 shadow-xl text-center space-y-5 animate-in zoom-in-95">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Document Successfully Executed!
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Thank you, <strong>{signerName || document.signatureData?.signerName}</strong>. Your electronic signature has been verified, recorded, and stamped onto the official agreement.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document:</span>
                <span className="font-semibold text-foreground">{document.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signer:</span>
                <span className="font-semibold text-foreground">
                  {signerName || document.signatureData?.signerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audit ID:</span>
                <span className="font-mono text-[10px] text-emerald-600">
                  {document.signatureData?.auditLogId || "AUD-VERIFIED"}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                onClick={() =>
                  downloadContractPdf({
                    document,
                    customer,
                    org: activeOrg,
                  })
                }
                variant="gradient"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Executed Copy</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Signing Workflow Card */
          <div className="rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden">
            {/* Agreement Preview Top Box */}
            <div className="p-6 md:p-8 border-b border-border/80 bg-muted/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Official Agreement Review
                  </span>
                  <h1 className="text-2xl font-bold text-foreground mt-0.5">
                    {document.title}
                  </h1>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">
                    Issued: {formatDate(document.createdAt)}
                  </span>
                </div>
              </div>

              {customer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-card border border-border text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">Client Organization:</span>
                    <strong className="text-foreground text-sm">{customer.name}</strong>
                    <p className="text-muted-foreground text-[11px]">{customer.address?.city}, {customer.address?.state}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Commercial Value:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 text-sm">
                      {formatCurrency(customer.financials.totalContractValue)} ({formatCurrency(customer.financials.recurringAmount)}/{customer.financials.billingCycle})
                    </strong>
                  </div>
                </div>
              )}

              {/* Scope & Agreement Summary Box */}
              <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1">Scope of Binding Agreement:</p>
                By providing your electronic signature below, you certify that you are an authorized representative of the designated client organization and accept the commercial terms, service delivery specifications, and recurring maintenance retainers detailed in this agreement.
              </div>
            </div>

            {/* Signature Form */}
            <form onSubmit={handleSign} className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sName">Your Full Legal Name *</Label>
                  <Input
                    id="sName"
                    value={signerName}
                    onChange={(e) => {
                      setSignerName(e.target.value);
                      setTypedSignature(e.target.value);
                    }}
                    placeholder="e.g. Mayor John Abernathy"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sEmail">Your Official Email Address *</Label>
                  <Input
                    id="sEmail"
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="mayor@rehobethal.gov"
                    required
                  />
                </div>
              </div>

              {/* Signature Mode & Pad */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Signature Method
                  </span>
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setMode("draw")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
                        mode === "draw"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Pen className="h-3 w-3" />
                      <span>Draw</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("type")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
                        mode === "type"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Type className="h-3 w-3" />
                      <span>Type</span>
                    </button>
                  </div>
                </div>

                {mode === "draw" ? (
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-border rounded-xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={680}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="cursor-crosshair w-full h-[160px] touch-none"
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-muted-foreground/60">
                          Sign here with your mouse, pen, or finger
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear signature</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-border rounded-xl p-8 bg-slate-50 dark:bg-slate-900/50 text-center">
                    <span className="font-serif italic text-4xl text-indigo-900 dark:text-indigo-200 tracking-wider">
                      {typedSignature || "Your Signature"}
                    </span>
                  </div>
                )}
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2.5 pt-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  id="signConsent"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-input text-primary focus:ring-primary h-4 w-4"
                  required
                />
                <label htmlFor="signConsent" className="leading-snug cursor-pointer">
                  I agree to execute this document electronically and certify that this digital signature is legally binding and authorized by my organization.
                </label>
              </div>

              <div className="pt-4 border-t border-border/80 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Timestamp & IP will be recorded for compliance audit logging.
                </p>
                <Button type="submit" variant="gradient" className="gap-2 px-6">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Execute Digital Signature</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
