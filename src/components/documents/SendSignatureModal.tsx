"use client";

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ContractDocument, Customer } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import {
  Send,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  User,
  Sparkles
} from "lucide-react";

interface SendSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ContractDocument | null;
}

export function SendSignatureModal({
  isOpen,
  onClose,
  document,
}: SendSignatureModalProps) {
  const { customers, updateContract, sendNotification, currentUser } = useTenant();

  const customer = customers.find((c) => c.id === document?.customerId);

  const [senderEmail, setSenderEmail] = useState("jeff@staxifytech.com");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const signingUrl = document ? `${origin}/sign/${document.id}` : "";

  useEffect(() => {
    if (document) {
      const custName = customer?.name || document.customerName || "Client";
      const contact = customer?.contacts?.[0];
      const recEmail = contact?.email || "signer@client.com";
      const sub = `Action Required: Signature Request for ${custName} - ${document.title}`;
      
      setRecipientEmail(recEmail);
      setSubject(sub);
      setMessage(
        `Hello ${contact?.name || "Team"},\n\nPlease review and execute the ${document.title} for ${custName} via our secure digital signing portal:\n\n👉 Secure Signature Portal: ${origin}/sign/${document.id}\n\nUpon digital signature, a certified executed copy with cryptographic audit trail will be available for download.\n\nBest regards,\nJeff\nStaxify Executive Operations`
      );
    }
  }, [document, customer, origin]);

  if (!document) return null;

  // Copy Link to Clipboard
  const handleCopyLink = () => {
    if (navigator.clipboard && signingUrl) {
      navigator.clipboard.writeText(signingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Open Gmail Web Compose
  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientEmail
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    
    window.open(gmailUrl, "_blank");

    // Mark document as sent
    updateContract(document.id, { status: "sent_for_signature" });

    // Team notification
    sendNotification({
      recipientUserId: "all",
      senderUserId: currentUser?.uid || "user-1",
      senderName: "Digital E-Signature",
      type: "contract_sent",
      title: `✉️ Sent for Signature: ${document.title}`,
      messageSnippet: `Signature request dispatched to ${recipientEmail} from ${senderEmail}.`,
      targetUrl: "/documents",
      customerId: document.customerId,
      customerName: document.customerName,
      documentId: document.id,
    });

    onClose();
  };

  // Open Default Mail Client
  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(message)}`;

    window.location.href = mailtoUrl;

    updateContract(document.id, { status: "sent_for_signature" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/80 bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Send Agreement for Digital Signature</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Dispatch directly from your Google email ({senderEmail}) or copy the certified signing link.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Document Summary Card */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-foreground line-clamp-1">{document.title}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Client: <strong>{document.customerName || "General Vault"}</strong> • Status:{" "}
                <span className="capitalize">{document.status.replace(/_/g, " ")}</span>
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px] bg-background">
              E-Sign Ready
            </Badge>
          </div>

          {/* Email Sender & Recipient Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sendFrom" className="text-xs">From (Sender Account)</Label>
              <select
                id="sendFrom"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm font-semibold"
              >
                <option value="jeff@staxifytech.com">jeff@staxifytech.com (Executive)</option>
                <option value="operations@staxifytech.com">operations@staxifytech.com</option>
                <option value="billing@staxifytech.com">billing@staxifytech.com</option>
                <option value="support@staxifytech.com">support@staxifytech.com</option>
              </select>
            </div>

            <div>
              <Label htmlFor="recTo" className="text-xs">To (Client Signer Email) *</Label>
              <Input
                id="recTo"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="signer@client.gov"
                className="mt-1 text-xs font-medium"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emailSub" className="text-xs">Subject Line</Label>
            <Input
              id="emailSub"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          {/* Direct Signing Link Box */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Direct Public Signature Link</span>
              <span className="text-[10px] text-muted-foreground font-normal">Works on Mobile & Desktop</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={signingUrl}
                className="text-xs font-mono bg-background text-muted-foreground select-all h-8"
              />
              <Button
                type="button"
                variant={copied ? "default" : "outline"}
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 shrink-0 h-8 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer with 1-Click Gmail Action */}
        <DialogFooter className="p-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenMailto}
              className="gap-1.5 text-xs"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Default Mail App</span>
            </Button>

            <Button
              type="button"
              variant="gradient"
              size="sm"
              onClick={handleOpenGmail}
              className="gap-1.5 text-xs shadow-md"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send with Gmail ({senderEmail.split("@")[0]})</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
