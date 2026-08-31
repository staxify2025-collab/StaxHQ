"use client";

import React, { useState, useEffect } from "react";
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
import { Customer, CustomerType, CustomerStatus, BillingCycle } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { appConfig } from "@/config/appConfig";
import { formatCurrency } from "@/lib/utils";
import { Layers, Sparkles, DollarSign, Calculator } from "lucide-react";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Customer;
}

export function CustomerModal({ isOpen, onClose, initialData }: CustomerModalProps) {
  const { addCustomer, updateCustomer } = useTenant();

  const [name, setName] = useState(initialData?.name || "");
  const [primaryProduct, setPrimaryProduct] = useState(initialData?.primaryProduct || "GovStax");
  const [customProduct, setCustomProduct] = useState("");
  const [type, setType] = useState<CustomerType>(initialData?.type || "customer");
  const [status, setStatus] = useState<CustomerStatus>(initialData?.status || "active");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [street, setStreet] = useState(initialData?.address?.street || "");
  const [city, setCity] = useState(initialData?.address?.city || "");
  const [state, setState] = useState(initialData?.address?.state || "AL");
  const [zip, setZip] = useState(initialData?.address?.zip || "");

  // Contact
  const [contactName, setContactName] = useState(initialData?.contacts[0]?.name || "");
  const [contactTitle, setContactTitle] = useState(initialData?.contacts[0]?.title || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contacts[0]?.email || "");
  const [contactPhone, setContactPhone] = useState(initialData?.contacts[0]?.phone || "");

  // Financials
  const [setupFee, setSetupFee] = useState<number>(initialData?.financials.setupFee || 0);
  const [recurringAmount, setRecurringAmount] = useState<number>(initialData?.financials.recurringAmount || 0);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialData?.financials.billingCycle || "annually");
  const [totalValue, setTotalValue] = useState<number>(initialData?.financials.totalContractValue || 0);

  // Synchronize state when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrimaryProduct(initialData.primaryProduct || "GovStax");
      setType(initialData.type || "customer");
      setStatus(initialData.status || "active");
      setIndustry(initialData.industry || "");
      setWebsite(initialData.website || "");
      setStreet(initialData.address?.street || "");
      setCity(initialData.address?.city || "");
      setState(initialData.address?.state || "AL");
      setZip(initialData.address?.zip || "");
      setContactName(initialData.contacts[0]?.name || "");
      setContactTitle(initialData.contacts[0]?.title || "");
      setContactEmail(initialData.contacts[0]?.email || "");
      setContactPhone(initialData.contacts[0]?.phone || "");
      setSetupFee(initialData.financials.setupFee || 0);
      setRecurringAmount(initialData.financials.recurringAmount || 0);
      setBillingCycle(initialData.financials.billingCycle || "annually");
      setTotalValue(initialData.financials.totalContractValue || 0);
    }
  }, [initialData]);

  // Compute first-year total automatically
  const computedFirstYearRecurring =
    billingCycle === "monthly"
      ? recurringAmount * 12
      : billingCycle === "quarterly"
      ? recurringAmount * 4
      : billingCycle === "annually"
      ? recurringAmount
      : 0;

  const computedFirstYearTotal = setupFee + computedFirstYearRecurring;

  // Auto-fill total contract value on setup/recurring change if user hasn't overridden
  const handleSetupFeeChange = (val: number) => {
    setSetupFee(val);
    setTotalValue(val + computedFirstYearRecurring);
  };

  const handleRecurringAmountChange = (val: number) => {
    setRecurringAmount(val);
    const firstYr =
      billingCycle === "monthly"
        ? val * 12
        : billingCycle === "quarterly"
        ? val * 4
        : billingCycle === "annually"
        ? val
        : 0;
    setTotalValue(setupFee + firstYr);
  };

  const handleBillingCycleChange = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    const firstYr =
      cycle === "monthly"
        ? recurringAmount * 12
        : cycle === "quarterly"
        ? recurringAmount * 4
        : cycle === "annually"
        ? recurringAmount
        : 0;
    setTotalValue(setupFee + firstYr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const resolvedProduct =
      primaryProduct === "custom" ? customProduct || "Custom Software" : primaryProduct;

    const customerData = {
      name,
      primaryProduct: resolvedProduct,
      type,
      status,
      industry: industry || "General Business",
      website,
      address: {
        street,
        city,
        state,
        zip,
      },
      contacts: [
        {
          id: initialData?.contacts[0]?.id || `c-${Date.now()}`,
          name: contactName || "Primary Contact",
          title: contactTitle || "Lead Executive",
          email: contactEmail,
          phone: contactPhone,
          isPrimary: true,
        },
      ],
      financials: {
        setupFee: Number(setupFee) || 0,
        recurringAmount: Number(recurringAmount) || 0,
        billingCycle,
        totalContractValue: Number(totalValue) || computedFirstYearTotal,
        paymentStatus: initialData?.financials.paymentStatus || "current",
        startDate: initialData?.financials.startDate || Date.now(),
        nextRenewalDate: initialData?.financials.nextRenewalDate || Date.now() + 365 * 86400000,
      },
      projects: initialData?.projects || [
        {
          id: `proj-${Date.now()}`,
          name: `${resolvedProduct} Deployment`,
          description: `Active instance of ${resolvedProduct} for ${name}`,
          status: "live",
          productsUsed: [resolvedProduct],
          activeUsersCount: 10,
          updatedAt: Date.now(),
        },
      ],
      tags: initialData?.tags || [resolvedProduct, type === "customer" ? "Active Account" : "Prospect Lead"],
      notesCount: initialData?.notesCount || 0,
      documentsCount: initialData?.documentsCount || 0,
    };

    if (initialData) {
      updateCustomer(initialData.id, customerData);
    } else {
      addCustomer(customerData);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Customer / Account" : "Add New Customer or Prospect"}
          </DialogTitle>
          <DialogDescription>
            Enter organization details, assigned software platform, primary executive contact, and financial contract scope.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Basic Org Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Organization & Product Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orgName">Organization / Customer Name *</Label>
                <Input
                  id="orgName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Town of Rehobeth"
                  required
                />
              </div>

              {/* Product Selection */}
              <div>
                <Label htmlFor="productSelect">Deployed Software / Product *</Label>
                <select
                  id="productSelect"
                  value={primaryProduct}
                  onChange={(e) => setPrimaryProduct(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                >
                  {appConfig.defaultProducts.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="custom">Other / Custom Product...</option>
                </select>
                {primaryProduct === "custom" && (
                  <Input
                    className="mt-2 text-xs"
                    placeholder="Enter custom product name"
                    value={customProduct}
                    onChange={(e) => setCustomProduct(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <Label htmlFor="industry">Industry / Sector</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Municipal Government, Healthcare"
                />
              </div>

              <div>
                <Label htmlFor="type">Account Classification</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as CustomerType)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="customer">Active Customer</option>
                  <option value="prospect">Prospective Lead</option>
                  <option value="partner">Strategic Partner</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="status">Pipeline Stage</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active (Contracted)</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="contacted">Contacted / Negotiating</option>
                  <option value="lead">New Lead</option>
                  <option value="churned">Inactive / Churned</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-3">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="5449 County Road 203"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Rehobeth"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="AL"
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="36301"
                />
              </div>
            </div>
          </div>

          {/* Primary Contact Person */}
          <div className="space-y-4 pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Primary Contact Person
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Full Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Mayor John Abernathy"
                />
              </div>
              <div>
                <Label htmlFor="contactTitle">Role / Title</Label>
                <Input
                  id="contactTitle"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  placeholder="e.g. Mayor, City Clerk, CIO"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="mayor@rehobethal.gov"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(334) 555-0142"
                />
              </div>
            </div>
          </div>

          {/* Financial & Contract Scope */}
          <div className="space-y-4 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Contract Financials, Build Fees & Retainers
              </h4>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <Calculator className="h-3.5 w-3.5" />
                <span>Auto-calculates Year 1 total</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Build Fee */}
              <div>
                <Label htmlFor="setupFee" className="flex items-center justify-between">
                  <span>One-Time Build Fee ($)</span>
                  <span className="text-[10px] text-muted-foreground">Setup</span>
                </Label>
                <Input
                  id="setupFee"
                  type="number"
                  value={setupFee}
                  onChange={(e) => handleSetupFeeChange(Number(e.target.value))}
                  placeholder="2500"
                />
              </div>

              {/* Recurring Retainer */}
              <div>
                <Label htmlFor="recurringAmount" className="flex items-center justify-between">
                  <span>Ongoing Retainer ($)</span>
                  <span className="text-[10px] text-muted-foreground">Recurring</span>
                </Label>
                <Input
                  id="recurringAmount"
                  type="number"
                  value={recurringAmount}
                  onChange={(e) => handleRecurringAmountChange(Number(e.target.value))}
                  placeholder="5000"
                />
              </div>

              {/* Billing Frequency */}
              <div>
                <Label htmlFor="billingCycle">Billing Frequency</Label>
                <select
                  id="billingCycle"
                  value={billingCycle}
                  onChange={(e) => handleBillingCycleChange(e.target.value as BillingCycle)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                >
                  <option value="annually">Annually ($/year)</option>
                  <option value="monthly">Monthly ($/mo)</option>
                  <option value="quarterly">Quarterly ($/quarter)</option>
                  <option value="one-time">One-Time Only (No Retainer)</option>
                </select>
              </div>
            </div>

            {/* LIVE CALCULATION PREVIEW BOX */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-card border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Client Investment Breakdown</span>
                </span>
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  Year 1: {formatCurrency(computedFirstYearTotal)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-indigo-500/20">
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground block">First Year (Initial Year):</span>
                  {setupFee > 0 ? (
                    <span>
                      {formatCurrency(setupFee)} Build Fee + {formatCurrency(computedFirstYearRecurring)} Retainer = <strong className="text-foreground">{formatCurrency(computedFirstYearTotal)}</strong>
                    </span>
                  ) : (
                    <span>{formatCurrency(computedFirstYearRecurring)} ({billingCycle})</span>
                  )}
                </div>

                <div className="text-muted-foreground sm:text-right">
                  <span className="font-medium text-foreground block">Subsequent Years (Renewal):</span>
                  {billingCycle !== "one-time" ? (
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(recurringAmount)} / {billingCycle === "annually" ? "year" : billingCycle === "monthly" ? "month" : "quarter"}
                    </strong>
                  ) : (
                    <span className="text-muted-foreground">None (One-time project)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Contract Value Override */}
            <div>
              <Label htmlFor="totalValue" className="flex items-center justify-between">
                <span>Total Contract Value Commitment ($)</span>
                <span className="text-[10px] text-muted-foreground">Defaults to Year 1 Total or Multi-Year Total</span>
              </Label>
              <Input
                id="totalValue"
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(Number(e.target.value))}
                placeholder="7500"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              {initialData ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
