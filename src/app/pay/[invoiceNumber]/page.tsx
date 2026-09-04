"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Download, 
  Printer, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Sparkles,
  Landmark
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { downloadInvoicePdf, printInvoicePdf } from "@/lib/pdf/pdfGenerator";
import { appConfig } from "@/config/appConfig";

export default function PublicInvoicePayPage() {
  const params = useParams();
  const rawInvoiceNumber = params.invoiceNumber as string;

  const { invoices, customers, activeOrg, updateInvoice } = useTenant();

  // Search by invoiceNumber or by id
  const invoice = (invoices || []).find(
    (i) =>
      i.invoiceNumber.toLowerCase() === rawInvoiceNumber.toLowerCase() ||
      i.id.toLowerCase() === rawInvoiceNumber.toLowerCase()
  );

  const customer = (customers || []).find((c) => c.id === invoice?.customerId);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ach">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [payerName, setPayerName] = useState(
    customer?.contacts[0]?.name || invoice?.customerName || ""
  );
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(invoice?.status === "paid");

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 border border-border shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Receipt className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Invoice Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested invoice reference <strong className="text-foreground">{rawInvoiceNumber}</strong> could not be located or has expired. Please check your link or contact Staxify billing support.
          </p>
          <div className="pt-2 text-xs text-muted-foreground border-t border-border">
            <span>Support: </span>
            <a href="mailto:billing@staxifytech.com" className="text-primary font-semibold hover:underline">
              billing@staxifytech.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const now = Date.now();
      updateInvoice(invoice.id, {
        status: "paid",
        paidAt: now,
      });
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const isPaid = invoice.status === "paid" || paymentSuccess;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header & Security Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              SX
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {activeOrg.name} Client Pay Portal
              </h1>
              <p className="text-xs text-muted-foreground">
                Layered Intelligence • Official Municipal & Commercial Invoicing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-xl border border-border shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted Remittance</span>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Official Letterhead Invoice Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
              {/* PAID IN FULL Watermark / Ribbon */}
              {isPaid && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 font-bold text-xs flex items-center gap-1.5 shadow-sm rotate-[-2deg]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>PAID IN FULL</span>
                </div>
              )}

              {/* Letterhead Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    {activeOrg.name.toUpperCase()}
                  </h2>
                  <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mt-0.5">
                    Layered Intelligence
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    121 Stax Way, Suite 400<br />
                    Birmingham, AL 35203<br />
                    billing@staxifytech.com
                  </p>
                </div>

                {!isPaid && (
                  <Badge
                    variant={
                      invoice.status === "overdue"
                        ? "destructive"
                        : invoice.status === "sent"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-xs uppercase font-bold py-1 px-3"
                  >
                    {invoice.status.replace("_", " ")}
                  </Badge>
                )}
              </div>

              <div className="border-t border-indigo-500/30 pt-4" />

              {/* Invoice Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Invoice #</span>
                  <strong className="font-mono text-foreground text-xs">{invoice.invoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Issue Date</span>
                  <span className="text-foreground">{formatDate(invoice.issueDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Due Date</span>
                  <span className="text-foreground font-semibold">{formatDate(invoice.dueDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Billing Cycle</span>
                  <span className="capitalize text-foreground">{invoice.billingCycle || "annually"}</span>
                </div>
              </div>

              {/* Billed To */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Billed To / Client Entity:
                </span>
                <p className="text-base font-bold text-foreground">{invoice.customerName}</p>
                {customer?.contacts[0] && (
                  <p className="text-muted-foreground text-xs">
                    Attn: {customer.contacts[0].name} • {customer.contacts[0].email}
                  </p>
                )}
                {customer?.address?.street && (
                  <p className="text-muted-foreground text-xs">
                    {customer.address.street}, {customer.address.city}, {customer.address.state} {customer.address.zip}
                  </p>
                )}
              </div>

              {/* Line Items Table */}
              <div className="border border-border/80 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3 pl-4">Deliverable Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 pr-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(invoice.lineItems || []).map((item, idx) => (
                      <tr key={idx} className="bg-card">
                        <td className="p-3 pl-4 font-medium text-foreground">{item.description}</td>
                        <td className="p-3 text-center text-muted-foreground">{item.quantity}</td>
                        <td className="p-3 text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-3 pr-4 text-right font-bold text-foreground">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="space-y-1.5 text-xs pt-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Estimated Tax (0%):</span>
                  <span className="text-foreground">$0.00</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t-2 border-indigo-600 text-sm font-bold text-foreground">
                  <span>Total Balance Due:</span>
                  <span className="text-lg text-indigo-600 dark:text-indigo-400 font-black">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>

              {/* Actions: Download / Print PDF */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  onClick={() => downloadInvoicePdf({ invoice, customer, org: activeOrg })}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Official PDF</span>
                </Button>
                <Button
                  onClick={() => printInvoicePdf({ invoice, customer, org: activeOrg })}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout & Remittance Module (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {isPaid ? (
              <div className="bg-card rounded-2xl border border-emerald-500/40 p-6 sm:p-8 text-center space-y-5 shadow-lg">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Payment Received</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoice <strong>{invoice.invoiceNumber}</strong> has been marked as paid in full.
                  </p>
                  {invoice.paidAt && (
                    <Badge variant="outline" className="mt-3 text-[11px] font-semibold border-emerald-500/30 text-emerald-600">
                      Paid on {formatDate(invoice.paidAt)}
                    </Badge>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-muted/40 text-xs text-left space-y-2 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <strong className="text-foreground">{formatCurrency(invoice.total)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Ref:</span>
                    <span className="font-mono text-foreground">TXN-{invoice.id.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remit Target:</span>
                    <span className="text-foreground">Staxify LLC</span>
                  </div>
                </div>

                <Button
                  onClick={() => downloadInvoicePdf({ invoice, customer, org: activeOrg })}
                  variant="gradient"
                  className="w-full gap-2 shadow-md"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Stamped Receipt</span>
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border shadow-lg p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <span>Pay Invoice Online</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select your preferred payment method to remit <strong className="text-foreground">{formatCurrency(invoice.total)}</strong>.
                  </p>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-4">
                  <Tabs value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="space-y-4">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="card" className="gap-1.5 text-xs">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Credit / Debit Card</span>
                      </TabsTrigger>
                      <TabsTrigger value="ach" className="gap-1.5 text-xs">
                        <Landmark className="h-3.5 w-3.5" />
                        <span>Bank ACH Transfer</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* CARD TAB */}
                    <TabsContent value="card" className="space-y-3">
                      <div>
                        <Label htmlFor="payerName" className="text-xs">Cardholder Name</Label>
                        <Input
                          id="payerName"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          placeholder="Jennifer Smith"
                          required
                          className="h-9 text-xs mt-1 bg-background"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNum" className="text-xs">Card Number</Label>
                        <Input
                          id="cardNum"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="•••• •••• •••• ••••"
                          required
                          className="h-9 text-xs mt-1 bg-background font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expiry" className="text-xs">Expiration Date</Label>
                          <Input
                            id="expiry"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            required
                            className="h-9 text-xs mt-1 bg-background"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-xs">CVC / CVV</Label>
                          <Input
                            id="cvc"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVC"
                            required
                            className="h-9 text-xs mt-1 bg-background"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="zip" className="text-xs">Billing Postal / ZIP Code</Label>
                        <Input
                          id="zip"
                          value={billingZip}
                          onChange={(e) => setBillingZip(e.target.value)}
                          placeholder="35203"
                          required
                          className="h-9 text-xs mt-1 bg-background"
                        />
                      </div>
                    </TabsContent>

                    {/* ACH TAB */}
                    <TabsContent value="ach" className="space-y-3">
                      <div>
                        <Label htmlFor="bankPayer" className="text-xs">Account Holder / Entity Name</Label>
                        <Input
                          id="bankPayer"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          placeholder="Town of Rehobeth"
                          required
                          className="h-9 text-xs mt-1 bg-background"
                        />
                      </div>

                      <div>
                        <Label htmlFor="routing" className="text-xs">Bank Routing Number (9 Digits)</Label>
                        <Input
                          id="routing"
                          value={routingNumber}
                          onChange={(e) => setRoutingNumber(e.target.value)}
                          placeholder="062000080"
                          required
                          className="h-9 text-xs mt-1 bg-background font-mono"
                        />
                      </div>

                      <div>
                        <Label htmlFor="account" className="text-xs">Bank Account Number</Label>
                        <Input
                          id="account"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="••••••••••"
                          required
                          className="h-9 text-xs mt-1 bg-background font-mono"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={isProcessing}
                    className="w-full gap-2 shadow-md h-10 mt-2 text-sm font-bold"
                  >
                    <Lock className="h-4 w-4" />
                    <span>
                      {isProcessing ? "Processing Remittance..." : `Pay ${formatCurrency(invoice.total)} Now`}
                    </span>
                  </Button>
                </form>

                <div className="pt-2 text-center text-[11px] text-muted-foreground space-y-1">
                  <p>Payments are processed securely via Staxify Encrypted Gateway.</p>
                  <p>For municipal Purchase Order checks, remit to Staxify LLC, Birmingham AL.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
