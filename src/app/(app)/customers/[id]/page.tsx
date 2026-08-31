"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  DollarSign, 
  FileText, 
  Calendar, 
  Plus, 
  Download, 
  Printer, 
  ShieldCheck, 
  Layers, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ExternalLink,
  Share2,
  Tag
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/notes/ActivityFeed";
import { CustomerModal } from "@/components/customers/CustomerModal";
import { DocumentUploaderModal } from "@/components/documents/DocumentUploaderModal";
import { SignatureCanvasModal } from "@/components/documents/SignatureCanvasModal";
import { downloadContractPdf, printContractPdf } from "@/lib/pdf/pdfGenerator";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { ContractDocument } from "@/types/crm";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { 
    customers, 
    contracts, 
    deleteCustomer, 
    updateContract, 
    activeOrg 
  } = useTenant();

  const customer = customers.find((c) => c.id === customerId);
  const customerContracts = contracts.filter((d) => d.customerId === customerId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [signDoc, setSignDoc] = useState<ContractDocument | null>(null);

  if (!customer) {
    return (
      <div className="py-16 text-center space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Customer Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested customer record does not exist or has been removed.
        </p>
        <Button onClick={() => router.push("/customers")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Button>
      </div>
    );
  }

  const primaryContact = customer.contacts.find((c) => c.isPrimary) || customer.contacts[0];
  const setup = customer.financials.setupFee || 0;
  const recurring = customer.financials.recurringAmount || 0;
  const cycle = customer.financials.billingCycle;

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
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {customer.name}
              </h1>
              <Badge variant="purple" className="font-bold text-xs">
                {customer.primaryProduct || "GovStax"}
              </Badge>
              <Badge
                variant={
                  customer.status === "active"
                    ? "success"
                    : customer.status === "proposal_sent"
                    ? "warning"
                    : "secondary"
                }
                className="uppercase text-[11px] font-bold py-0.5"
              >
                {customer.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>{customer.industry}</span>
              {customer.address?.city && (
                <>
                  <span>•</span>
                  <span>{customer.address.city}, {customer.address.state}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Upload Document</span>
          </Button>

          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Account</span>
          </Button>

          <Button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
                deleteCustomer(customer.id);
                router.push("/customers");
              }
            }}
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            One-Time Build Fee
          </span>
          <span className="text-xl font-bold text-foreground mt-1 block">
            {setup > 0 ? formatCurrency(setup) : "No Setup Fee"}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Initial Setup & Build
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Ongoing Retainer
          </span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {formatCurrency(recurring)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block capitalize">
            {cycle === "annually" ? "Per Year" : cycle === "monthly" ? "Per Month" : cycle === "quarterly" ? "Per Quarter" : "One-Time"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Year 1 Total Investment
          </span>
          <span className="text-xl font-bold text-foreground mt-1 block">
            {formatCurrency(customer.financials.totalContractValue)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
            Build Fee + First Year
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Documents & Contracts
          </span>
          <span className="text-xl font-bold text-foreground mt-1 block">
            {customerContracts.length} Files
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
            {customerContracts.filter((d) => d.status === "signed").length} Executed
          </span>
        </div>
      </div>

      {/* Main Command Center Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({customerContracts.length})
          </TabsTrigger>
          <TabsTrigger value="notes">Team Notes</TabsTrigger>
          <TabsTrigger value="projects">Deployments</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Contact Person & Info */}
            <Card className="lg:col-span-1 border-border/80">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Key Executive Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {customer.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {contact.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {contact.title}
                          </p>
                        </div>
                      </div>
                      {contact.isPrimary && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                          PRIMARY
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1 pt-1 border-t border-border/40 text-muted-foreground">
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-indigo-500" />
                          <a href={`mailto:${contact.email}`} className="hover:underline text-foreground">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Organization Details */}
                <div className="pt-2 text-xs space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>Product: <strong className="text-foreground">{customer.primaryProduct || "GovStax"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      {customer.address?.street
                        ? `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`
                        : "No physical address specified"}
                    </span>
                  </div>
                  {customer.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={customer.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <span>{customer.website}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right: Quick Documents & Notes Preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Overview Card */}
              <Card className="border-border/80">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Contracts & Agreements
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Official legal documents, SLAs, and proposals on file
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add File</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-5 space-y-2.5">
                  {customerContracts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No documents uploaded yet for this account.
                    </div>
                  ) : (
                    customerContracts.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{doc.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {doc.type.toUpperCase()} • {formatDate(doc.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={doc.status === "signed" ? "success" : "secondary"}
                            className="text-[10px] uppercase font-bold"
                          >
                            {doc.status.replace("_", " ")}
                          </Badge>
                          <Button
                            onClick={() =>
                              downloadContractPdf({
                                document: doc,
                                customer,
                                org: activeOrg,
                              })
                            }
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Activity Feed Embed */}
              <ActivityFeed customerId={customer.id} customerName={customer.name} />
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: DOCUMENTS & CONTRACTS */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Document Repository</h3>
              <p className="text-xs text-muted-foreground">
                Manage, print, watermark, and send contracts for digital signature.
              </p>
            </div>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              variant="gradient"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Document</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {customerContracts.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-card">
                <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No documents yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your signed contracts, proposals, or SLAs.
                </p>
              </div>
            ) : (
              customerContracts.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-border/80 bg-card shadow-sm hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">{doc.title}</h4>
                        <Badge
                          variant={doc.status === "signed" ? "success" : "secondary"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {doc.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.fileName || `${doc.title}.pdf`} • Added {formatDate(doc.createdAt)}
                      </p>
                      {doc.signatureData?.signedAt && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            Digitally Signed by {doc.signatureData.signerName} ({formatDate(doc.signatureData.signedAt)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.status !== "signed" && (
                      <Button
                        onClick={() => setSignDoc(doc)}
                        size="sm"
                        variant="gradient"
                        className="gap-1.5 text-xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Sign Digitally</span>
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        const url = `${window.location.origin}/sign/${doc.id}`;
                        navigator.clipboard.writeText(url);
                        alert(`Public Signing Link copied to clipboard:\n${url}`);
                      }}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      title="Copy Public E-Sign URL"
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
                      title="Print with Company Header & Watermark"
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
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 3: NOTES */}
        <TabsContent value="notes">
          <ActivityFeed customerId={customer.id} customerName={customer.name} />
        </TabsContent>

        {/* TAB 4: DEPLOYMENTS & PROJECTS */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Active Systems & Deployments</h3>
              <p className="text-xs text-muted-foreground">
                Software tools, municipal platforms, and user seats configured for this client.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.projects.length === 0 ? (
              <div className="col-span-full p-12 text-center border border-dashed border-border rounded-2xl bg-card">
                <Layers className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No active software deployments</p>
              </div>
            ) : (
              customer.projects.map((proj) => (
                <Card key={proj.id} className="border-border/80">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          {proj.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {proj.description || "Core Enterprise System"}
                        </CardDescription>
                      </div>
                      <Badge variant="success" className="uppercase text-[10px] font-bold">
                        {proj.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.productsUsed.map((p, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Active Seats: <strong className="text-foreground">{proj.activeUsersCount} users</strong></span>
                      {proj.leadEngineer && (
                        <span>Lead: <strong className="text-foreground">{proj.leadEngineer}</strong></span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={customer}
      />

      <DocumentUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultCustomerId={customer.id}
      />

      <SignatureCanvasModal
        isOpen={!!signDoc}
        onClose={() => setSignDoc(null)}
        document={signDoc}
        onSignComplete={handleSignComplete}
      />
    </div>
  );
}
