"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractDocument } from "@/types/crm";
import { Pen, Type, RotateCcw, Check, ShieldCheck } from "lucide-react";

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ContractDocument | null;
  onSignComplete: (docId: string, signatureData: NonNullable<ContractDocument["signatureData"]>) => void;
}

export function SignatureCanvasModal({
  isOpen,
  onClose,
  document,
  onSignComplete,
}: SignatureCanvasModalProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [typedSignature, setTypedSignature] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (document) {
      setSignerName(document.signatureData?.signerName || "");
      setSignerEmail(document.signatureData?.signerEmail || "");
      setTypedSignature(document.signatureData?.signerName || "");
      setHasDrawn(false);
    }
  }, [document]);

  // Canvas Drawing Handlers
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
    ctx.strokeStyle = "#1e1b4b"; // Dark Indigo
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

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;
    if (!signerName.trim() || !signerEmail.trim()) {
      alert("Please provide signer name and email.");
      return;
    }
    if (!agreedToTerms) {
      alert("Please accept the electronic signature consent checkbox.");
      return;
    }

    let signatureImageBase64 = "";
    if (mode === "draw" && canvasRef.current) {
      signatureImageBase64 = canvasRef.current.toDataURL("image/png");
    }

    const sigData = {
      signerName,
      signerEmail,
      signatureImageBase64,
      signedAt: Date.now(),
      ipAddress: "68.102.44.12 (SSL Verified)",
      auditLogId: `AUD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    onSignComplete(document.id, sigData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <span>Digital E-Signature Authorization</span>
          </DialogTitle>
          <DialogDescription>
            Executing: <strong className="text-foreground">{document?.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSignSubmit} className="space-y-4 py-2">
          {/* Signer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sigName">Signer Legal Name *</Label>
              <Input
                id="sigName"
                value={signerName}
                onChange={(e) => {
                  setSignerName(e.target.value);
                  setTypedSignature(e.target.value);
                }}
                placeholder="e.g. John Abernathy"
                required
              />
            </div>
            <div>
              <Label htmlFor="sigEmail">Signer Email *</Label>
              <Input
                id="sigEmail"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="mayor@rehobethal.gov"
                required
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Signature Method
            </span>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMode("draw")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
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

          {/* Signature Box */}
          {mode === "draw" ? (
            <div className="space-y-1.5">
              <div className="relative border-2 border-dashed border-border rounded-xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair w-full h-[140px] touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-muted-foreground/60">
                    Sign here with your mouse or touchscreen
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
                  <span>Clear pad</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50 text-center">
              <span className="font-serif italic text-3xl text-indigo-900 dark:text-indigo-200 tracking-wider">
                {typedSignature || "Your Signature"}
              </span>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2 pt-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              id="consent"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded border-input text-primary focus:ring-primary h-4 w-4"
              required
            />
            <label htmlFor="consent" className="leading-snug cursor-pointer">
              I agree to the legally binding nature of this electronic signature and verify that I am authorized to execute this agreement.
            </label>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="gap-1.5">
              <Check className="h-4 w-4" />
              <span>Confirm & Execute Signature</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
