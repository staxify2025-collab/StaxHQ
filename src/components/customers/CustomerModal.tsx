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
import { Customer, CustomerType, CustomerStatus, BillingCycle } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Customer;
}

export function CustomerModal({ isOpen, onClose, initialData }: CustomerModalProps) {
  const { addCustomer, updateCustomer } = useTenant();

  const [name, setName] = useState(initialData?.name || "");
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
  const [totalValue, setTotalValue] = useState(initialData?.financials.totalContractValue || 0);
  const [recurringAmount, setRecurringAmount] = useState(initialData?.financials.recurringAmount || 0);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialData?.financials.billingCycle || "monthly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const customerData = {
      name,
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
        totalContractValue: Number(totalValue) || 0,
        recurringAmount: Number(recurringAmount) || 0,
        billingCycle,
        paymentStatus: initialData?.financials.paymentStatus || "current",
        startDate: initialData?.financials.startDate || Date.now(),
        nextRenewalDate: initialData?.financials.nextRenewalDate || Date.now() + 365 * 86400000,
      },
      projects: initialData?.projects || [],
      tags: initialData?.tags || [type === "customer" ? "Active Account" : "Prospect Lead"],
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
            Enter organization details, primary executive contact, and financial contract scope.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Basic Org Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Organization Profile
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

              <div>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Contract Financials & Retainer
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="totalValue">Total Contract Value ($)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  value={totalValue}
                  onChange={(e) => setTotalValue(Number(e.target.value))}
                  placeholder="48000"
                />
              </div>
              <div>
                <Label htmlFor="recurringAmount">Recurring Amount ($)</Label>
                <Input
                  id="recurringAmount"
                  type="number"
                  value={recurringAmount}
                  onChange={(e) => setRecurringAmount(Number(e.target.value))}
                  placeholder="4000"
                />
              </div>
              <div>
                <Label htmlFor="billingCycle">Billing Frequency</Label>
                <select
                  id="billingCycle"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                  <option value="one-time">One-Time Project</option>
                </select>
              </div>
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
