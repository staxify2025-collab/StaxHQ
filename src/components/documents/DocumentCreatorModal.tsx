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
import { 
  ContractDocument, 
  ContractTemplate, 
  DocumentScope, 
  DocumentType, 
  SignaturePlacement, 
  WatermarkOption 
} from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import {
  Sparkles,
  FileText,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ScrollText,
  FileSignature,
  DollarSign,
  Landmark,
  Plus,
  Layers,
  Send,
  Save,
  Check,
  Tag
} from "lucide-react";
import { replaceMergeTags, formatCurrency } from "@/lib/utils";

interface DocumentCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  onDocumentCreated?: (doc: ContractDocument) => void;
  onSendForSignature?: (doc: ContractDocument) => void;
}

export function DocumentCreatorModal({
  isOpen,
  onClose,
  defaultCustomerId,
  onDocumentCreated,
  onSendForSignature,
}: DocumentCreatorModalProps) {
  const { customers, activeOrg, addContract, templates, addTemplate } = useTenant();

  const [activeTab, setActiveTab] = useState<"generate" | "template_vault">("generate");

  // --- TAB 1: GENERATE CLIENT DOCUMENT STATE ---
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || "tpl-govstax-msa");
  const [docTitle, setDocTitle] = useState("Master Services Agreement (MSA) - 2026");
  const [scope, setScope] = useState<DocumentScope>("client_contract");
  const [customerId, setCustomerId] = useState<string>(defaultCustomerId || customers[0]?.id || "");
  const [watermark, setWatermark] = useState<WatermarkOption>("STAXIFY");
  const [signaturePlacement, setSignaturePlacement] = useState<SignaturePlacement>("dual");
  const [editableScopeText, setEditableScopeText] = useState<string>("");

  // --- TAB 2: CREATE / EDIT MASTER TEMPLATE STATE ---
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateProductTag, setNewTemplateProductTag] = useState("GovStax");
  const [newTemplateCategory, setNewTemplateCategory] = useState<ContractTemplate["category"]>("agreement");
  const [newTemplateWatermark, setNewTemplateWatermark] = useState<WatermarkOption>("STAXIFY");
  const [newTemplateSigPlacement, setNewTemplateSigPlacement] = useState<SignaturePlacement>("dual");
  const [newTemplateScopeText, setNewTemplateScopeText] = useState("");
  const [templateSavedAlert, setTemplateSavedAlert] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  // Sync selected template when changed
  useEffect(() => {
    const tpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (tpl) {
      setDocTitle(tpl.title);
      setWatermark(tpl.defaultWatermark || "STAXIFY");
      setSignaturePlacement(tpl.signaturePlacement || "dual");
      
      // Auto-interpolate with customer data
      const interpolated = replaceMergeTags(tpl.scopeAndTermsText, selectedCustomer);
      setEditableScopeText(interpolated);
    }
  }, [selectedTemplateId, customerId, templates]);

  // Handle Tag Insertion in Template Creator
  const insertMergeTag = (tag: string) => {
    setNewTemplateScopeText((prev) => `${prev} ${tag} `);
  };

  // Generate & Save Document
  const handleCreateDocument = (sendDirectly: boolean = false) => {
    if (!docTitle.trim()) return;

    const tpl = templates.find((t) => t.id === selectedTemplateId);

    const newDoc: Omit<ContractDocument, "id" | "orgId" | "createdAt" | "updatedAt"> = {
      title: docTitle,
      scope,
      type: (tpl?.category as DocumentType) || "agreement",
      status: sendDirectly ? "sent_for_signature" : scope === "company_vault" ? "official_record" : "draft",
      customerId: scope === "client_contract" && selectedCustomer ? selectedCustomer.id : undefined,
      customerName: scope === "client_contract" && selectedCustomer ? selectedCustomer.name : undefined,
      watermarkText: watermark === "NONE" ? undefined : watermark,
      signatureRequired: signaturePlacement !== "none",
      signaturePlacement,
      fileName: `${docTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`,
      fileSizeBytes: 220000,
      isGenerated: true,
      templateType: (tpl?.category as any) || "custom",
      contentHtml: editableScopeText,
      templateData: {
        scopeAndTermsText: editableScopeText,
        templateId: selectedTemplateId,
        templateTitle: tpl?.title,
      },
    };

    const created = addContract(newDoc);
    if (onDocumentCreated) onDocumentCreated(created);

    if (sendDirectly && onSendForSignature) {
      onSendForSignature(created);
    }
    onClose();
  };

  // Save Master Template
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim() || !newTemplateScopeText.trim()) return;

    const newTpl = addTemplate({
      title: newTemplateTitle,
      description: `Custom ${newTemplateProductTag} agreement template.`,
      productTag: newTemplateProductTag,
      category: newTemplateCategory,
      defaultWatermark: newTemplateWatermark,
      signaturePlacement: newTemplateSigPlacement,
      scopeAndTermsText: newTemplateScopeText,
      isDefault: false,
    });

    setTemplateSavedAlert(true);
    setTimeout(() => setTemplateSavedAlert(false), 3000);

    // Switch back to generate tab with new template selected
    setSelectedTemplateId(newTpl.id);
    setActiveTab("generate");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border">
        {/* Header with Mode Tabs */}
        <DialogHeader className="p-5 pb-3 border-b border-border/80 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Document & Contract Customizer Hub</span>
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Generate tailored client agreements with live editable scope or author reusable Master Templates.
              </DialogDescription>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center p-1 rounded-xl bg-background border border-input shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("generate")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "generate"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileSignature className="h-3.5 w-3.5" />
                <span>Generate Client Doc</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("template_vault")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "template_vault"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>+ Template Vault</span>
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "generate" ? (
            <div className="space-y-5">
              {/* Step 1: Select Template via Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="templateDropdown" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    1. Choose Master Template From Vault *
                  </Label>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    {templates.length} Active Templates in Vault
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <select
                    id="templateDropdown"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-indigo-500/40 bg-card text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  >
                    {templates.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.title} ({tmpl.productTag || "All"} • {tmpl.category.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("template_vault")}
                    className="gap-1.5 text-xs shrink-0 h-10 border-indigo-500/30"
                  >
                    <Plus className="h-3.5 w-3.5 text-indigo-600" />
                    <span>+ New Template</span>
                  </Button>
                </div>
              </div>

              {/* Step 2: Target Customer & Details */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  2. Client Association & Document Details
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="custSelect" className="text-xs">Associated Customer / Client *</Label>
                    <select
                      id="custSelect"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm font-semibold"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.primaryProduct || "GovStax"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="docTitle" className="text-xs">Document Title *</Label>
                    <Input
                      id="docTitle"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="e.g. GovStax Master Services Agreement"
                      className="mt-1 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Auto-Calculated Financial Summary Banner */}
                {selectedCustomer && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-foreground">{selectedCustomer.name}</span>
                      <span className="text-muted-foreground ml-2">
                        Product: <strong>{selectedCustomer.primaryProduct || "GovStax"}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {selectedCustomer.financials && (selectedCustomer.financials.setupFee || 0) > 0 && (
                        <span>Build: <strong>{formatCurrency(selectedCustomer.financials.setupFee || 0)}</strong></span>
                      )}
                      <span>
                        Retainer: <strong>{formatCurrency(selectedCustomer.financials?.recurringAmount || 0)}</strong> / {selectedCustomer.financials?.billingCycle || "annual"}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-background">
                        Auto-Populated
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Editable Scope of Services & Contract Terms */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <Label htmlFor="scopeText" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    3. Scope of Services & Custom Terms (Editable)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Customize language, deliverables, or payment milestones
                  </span>
                </div>
                <textarea
                  id="scopeText"
                  rows={6}
                  value={editableScopeText}
                  onChange={(e) => setEditableScopeText(e.target.value)}
                  placeholder="Enter customized scope of work, technical deliverables, and legal terms..."
                  className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>

              {/* Step 4: Watermark & Signature Placement */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  4. Watermarking & Signature Placement
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="watermarkSelect" className="text-xs">Watermark Overlay</Label>
                    <select
                      id="watermarkSelect"
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value as WatermarkOption)}
                      className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm font-medium"
                    >
                      <option value="NONE">No Watermark</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="FOR REVIEW ONLY">FOR REVIEW ONLY</option>
                      <option value="INTERNAL USE ONLY">INTERNAL USE ONLY</option>
                      <option value="STAXIFY">STAXIFY (Subtle Cyan-Indigo-Violet Mesh)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="sigPlacement" className="text-xs">Signature Placement</Label>
                    <select
                      id="sigPlacement"
                      value={signaturePlacement}
                      onChange={(e) => setSignaturePlacement(e.target.value as SignaturePlacement)}
                      className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm font-medium"
                    >
                      <option value="dual">Dual Execution (Staxify Left, Client Right)</option>
                      <option value="single_client">Single Client Signer (Client Right Only)</option>
                      <option value="none">No Signature Execution Lines</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: CREATE / EDIT MASTER TEMPLATE */
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              {templateSavedAlert && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Master Template successfully created and saved to Vault!</span>
                </div>
              )}

              <div>
                <Label htmlFor="tplTitle" className="text-xs">Master Template Name *</Label>
                <Input
                  id="tplTitle"
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  placeholder="e.g. GovStax Master Services Agreement or Custom SLA"
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="tplProd" className="text-xs">Product Tag</Label>
                  <Input
                    id="tplProd"
                    value={newTemplateProductTag}
                    onChange={(e) => setNewTemplateProductTag(e.target.value)}
                    placeholder="e.g. GovStax or Company Pulse"
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="tplCat" className="text-xs">Category</Label>
                  <select
                    id="tplCat"
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="agreement">Master Agreement</option>
                    <option value="nda">Non-Disclosure (NDA)</option>
                    <option value="sow">Statement of Work (SOW)</option>
                    <option value="memo">Executive Memorandum</option>
                    <option value="custom">Custom Legal Form</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="tplWatermark" className="text-xs">Default Watermark</Label>
                  <select
                    id="tplWatermark"
                    value={newTemplateWatermark}
                    onChange={(e) => setNewTemplateWatermark(e.target.value as WatermarkOption)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="STAXIFY">STAXIFY (Brand Mesh)</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="FOR REVIEW ONLY">FOR REVIEW ONLY</option>
                    <option value="INTERNAL USE ONLY">INTERNAL USE ONLY</option>
                    <option value="NONE">No Watermark</option>
                  </select>
                </div>
              </div>

              {/* 1-Click Merge Tag Pill Buttons */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Insert Dynamic Client Merge Tags</span>
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "+ Customer Name", tag: "{{customer_name}}" },
                    { label: "+ Product Name", tag: "{{product_name}}" },
                    { label: "+ Build Fee", tag: "{{setup_fee}}" },
                    { label: "+ Retainer Amount", tag: "{{recurring_amount}}" },
                    { label: "+ Billing Cycle", tag: "{{billing_cycle}}" },
                    { label: "+ Total Investment", tag: "{{total_investment}}" },
                    { label: "+ Contact Name", tag: "{{contact_name}}" },
                    { label: "+ Client Address", tag: "{{address}}" },
                    { label: "+ Date", tag: "{{date}}" },
                  ].map((btn) => (
                    <button
                      key={btn.tag}
                      type="button"
                      onClick={() => insertMergeTag(btn.tag)}
                      className="px-2 py-1 rounded-lg bg-muted text-[11px] font-semibold text-foreground hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 border border-border/80 transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tplScope" className="text-xs font-bold">
                  Template Standard Terms & Scope Language *
                </Label>
                <textarea
                  id="tplScope"
                  rows={6}
                  value={newTemplateScopeText}
                  onChange={(e) => setNewTemplateScopeText(e.target.value)}
                  placeholder="Write reusable contract language with merge tags like {{customer_name}}, {{setup_fee}}, and {{recurring_amount}}..."
                  className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground font-mono leading-relaxed mt-1 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="gradient" size="sm" className="gap-1.5">
                  <Save className="h-4 w-4" />
                  <span>Save as Master Template</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer for Generate Tab */}
        {activeTab === "generate" && (
          <DialogFooter className="p-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/10">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCreateDocument(false)}
                className="gap-1.5 text-xs"
              >
                <Save className="h-4 w-4" />
                <span>Save to Client Hub</span>
              </Button>

              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={() => handleCreateDocument(true)}
                className="gap-1.5 text-xs shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>Save & Send for Signature</span>
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
