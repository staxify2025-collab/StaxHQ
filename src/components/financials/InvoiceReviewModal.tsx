"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Send, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  Building2, 
  Sparkles, 
  X,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  CreditCard
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Invoice, InvoiceLineItem } from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { downloadInvoicePdf, printInvoicePdf } from "@/lib/pdf/pdfGenerator";

interface InvoiceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoiceReviewModal({
  isOpen,
  onClose,
  invoice,
}: InvoiceReviewModalProps) {
  const { customers, activeOrg, updateInvoice, deleteInvoice, currentUser } = useTenant();

  const [senderEmail, setSenderEmail] = useState("jeff@staxifytech.com");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [dueDateStr, setDueDateStr] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const customer = (customers || []).find((c) => c.id === invoice?.customerId);

  useEffect(() => {
    if (invoice) {
      setNotes(invoice.notes || "");
      setDueDateStr(new Date(invoice.dueDate).toISOString().split("T")[0]);
      setLineItems(invoice.lineItems || []);
      const primaryContactEmail = customer?.contacts[0]?.email || "";
      setRecipientEmail(primaryContactEmail);
    }
  }, [invoice, customer]);

  if (!invoice) return null;

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const total = roundedSubtotal;

  const payUrl = typeof window !== "undefined"
    ? `${window.location.origin}/pay/${invoice.invoiceNumber}`
    : `https://staxifytech.com/pay/${invoice.invoiceNumber}`;

  const handleUpdateLineItem = (index: number, field: keyof InvoiceLineItem, val: any) => {
    const updated = [...lineItems];
    const current = { ...updated[index], [field]: val };
    if (field === "quantity" || field === "unitPrice") {
      const q = field === "quantity" ? Number(val) : current.quantity;
      const u = field === "unitPrice" ? Number(val) : current.unitPrice;
      current.amount = Math.round(q * u * 100) / 100;
    }
    updated[index] = current;
    setLineItems(updated);
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `li-${Date.now()}`,
        description: "Additional Software Service / Support Retainer",
        quantity: 1,
        unitPrice: 500,
        amount: 500,
      },
    ]);
  };

  const handleDeleteLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = () => {
    const updatedDue = dueDateStr ? new Date(dueDateStr).getTime() : invoice.dueDate;
    updateInvoice(invoice.id, {
      dueDate: updatedDue,
      lineItems,
      subtotal: roundedSubtotal,
      total,
      notes,
    });
  };

  const handleCopyPayLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDeleteInvoice = () => {
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      deleteInvoice(invoice.id);
      onClose();
    }
  };

  const handleSendGmail = () => {
    handleSaveInvoice();
    updateInvoice(invoice.id, {
      status: "sent",
      sentAt: Date.now(),
    });

    // Auto-download PDF for immediate Gmail attachment drag & drop
    downloadInvoicePdf({ 
      invoice: { ...invoice, lineItems, total, subtotal: roundedSubtotal }, 
      customer, 
      org: activeOrg 
    });

    const subject = `Official Invoice ${invoice.invoiceNumber} - ${invoice.customerName} | Staxify LLC`;
    const body = `Hello ${customer?.contacts[0]?.name || invoice.customerName},

Please find attached official invoice ${invoice.invoiceNumber} for ${invoice.customerName} in the amount of ${formatCurrency(total)}.

Payment Due Date: ${formatDate(dueDateStr ? new Date(dueDateStr).getTime() : invoice.dueDate)}
Billing Cycle: ${(invoice.billingCycle || "annually").toUpperCase()}

💳 PAY ONLINE (Credit Card / Bank ACH):
${payUrl}

OFFICIAL REMITTANCE INSTRUCTIONS:
Please remit payment directly to ${invoice.remitTo || "Staxify LLC"}.
Remittance Address: 121 Stax Way, Suite 400, Birmingham, AL 35203
ACH / Wire routing and municipal purchase order details are provided on the attached invoice file.

If you have any questions or require purchase order verification, please reach out directly.

Best regards,
Jeff
Staxify Executive Operations
jeff@staxifytech.com
https://staxifytech.com`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientEmail || ""
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank");
    onClose();
  };

  const handleMarkAsPaid = () => {
    handleSaveInvoice();
    updateInvoice(invoice.id, {
      status: "paid",
      paidAt: Date.now(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>{invoice.invoiceNumber}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{invoice.customerName}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Review deliverable line items, dispatch via Gmail, or generate official remittance PDF.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                invoice.status === "paid"
                  ? "success"
                  : invoice.status === "overdue"
                  ? "destructive"
                  : invoice.status === "sent"
                  ? "warning"
                  : "secondary"
              }
              className="text-xs uppercase font-bold"
            >
              {invoice.status.replace("_", " ")}
            </Badge>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Issue Date</span>
              <strong className="text-foreground">{formatDate(invoice.issueDate)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Payment Due Date</span>
              <Input
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="h-7 text-xs mt-0.5 bg-background font-semibold"
              />
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Billing Cycle</span>
              <strong className="text-foreground capitalize">{invoice.billingCycle || "annually"}</strong>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Itemized Scope & Deliverables
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLineItem}
                className="gap-1 text-xs h-7 border-dashed"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
              {lineItems.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center gap-2 text-xs">
                  <Input
                    value={item.description}
                    onChange={(e) => handleUpdateLineItem(idx, "description", e.target.value)}
                    placeholder="Deliverable Description"
                    className="flex-1 text-xs h-8 bg-background"
                  />
                  <div className="w-16">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleUpdateLineItem(idx, "quantity", e.target.value)}
                      placeholder="Qty"
                      className="text-xs h-8 bg-background text-center"
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateLineItem(idx, "unitPrice", e.target.value)}
                      placeholder="Rate ($)"
                      className="text-xs h-8 bg-background font-semibold"
                    />
                  </div>
                  <div className="w-24 text-right font-bold text-foreground text-xs pr-1">
                    {formatCurrency(item.amount)}
                  </div>
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLineItem(idx)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}

              {/* Total Summary Row */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Remit to: <strong className="text-foreground">{invoice.remitTo || "Staxify LLC"}</strong></span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-medium">Total Balance:</span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Online Payment Portal Link */}
          <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Online Client Payment Portal Link</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPayLink}
                className="h-6 px-2 text-[11px] gap-1 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 bg-background"
              >
                {copiedLink ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs bg-background p-2 rounded-lg border border-border/80 font-mono text-muted-foreground truncate">
              <span className="truncate">{payUrl}</span>
              <a
                href={payUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 ml-2 shrink-0 flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Clients can view their official letterhead invoice and securely remit payment via Credit Card or Bank ACH.
            </p>
          </div>

          {/* Dispatch Details */}
          <div className="space-y-3 pt-1 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Gmail Dispatch Credentials & Attachment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sendFrom" className="text-xs">Dispatch From (Google Account)</Label>
                <select
                  id="sendFrom"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-input bg-card text-xs text-foreground font-semibold mt-1"
                >
                  <option value="jeff@staxifytech.com">jeff@staxifytech.com (Executive)</option>
                  <option value="billing@staxifytech.com">billing@staxifytech.com (Billing)</option>
                  <option value="operations@staxifytech.com">operations@staxifytech.com (Operations)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="clientEmail" className="text-xs">Recipient Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="billing@client.gov"
                  className="h-8 text-xs mt-1 bg-background"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
              💡 <strong>Note:</strong> Clicking <em>Send with Gmail</em> will automatically download the official letterhead PDF to your downloads folder so you can instantly attach it into your opened Gmail message.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => printInvoicePdf({ invoice: { ...invoice, lineItems, total }, customer, org: activeOrg })}
              className="gap-1.5 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadInvoicePdf({ invoice: { ...invoice, lineItems, total }, customer, org: activeOrg })}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>PDF</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteInvoice}
              className="gap-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Delete this invoice"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== "paid" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMarkAsPaid}
                className="gap-1.5 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Paid</span>
              </Button>
            )}

            <Button
              type="button"
              variant="gradient"
              size="sm"
              onClick={handleSendGmail}
              className="gap-1.5 text-xs shadow-md"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send with Gmail</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
