"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Search, 
  Building2, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerModal } from "@/components/customers/CustomerModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerType } from "@/types/crm";
import { appConfig } from "@/config/appConfig";

export default function CustomersPage() {
  const { customers, isDemoMode, products } = useTenant();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productOptions = Array.from(new Set(["all", ...products]));

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.primaryProduct?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contacts.some(
        (ct) =>
          ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ct.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProduct =
      selectedProduct === "all"
        ? true
        : (c.primaryProduct || "GovStax").toLowerCase() === selectedProduct.toLowerCase();

    if (selectedTab === "all") return matchesSearch && matchesProduct;
    if (selectedTab === "active") return matchesSearch && matchesProduct && c.status === "active";
    if (selectedTab === "prospects")
      return matchesSearch && matchesProduct && (c.type === "prospect" || c.status !== "active");
    if (selectedTab === "partners") return matchesSearch && matchesProduct && c.type === "partner";
    return matchesSearch && matchesProduct;
  });

  const totalPortfolioValue = customers.reduce(
    (acc, c) => acc + (c.financials.totalContractValue || 0),
    0
  );
  const activeMRR = customers.reduce(
    (acc, c) =>
      acc +
      (c.financials.billingCycle === "monthly"
        ? c.financials.recurringAmount
        : c.financials.recurringAmount / 12),
    0
  );
  const activeCount = customers.filter((c) => c.status === "active").length;
  const prospectCount = customers.filter((c) => c.status !== "active").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>Customers & Pipeline</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your client organizations, municipal contracts, prospect leads, and executive contacts.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="gradient"
          className="gap-2 shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>New Customer / Prospect</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Clients
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{activeCount}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Contracted Accounts
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pipeline Prospects
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{prospectCount}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                Proposals & Leads
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Contract Portfolio
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(totalPortfolioValue)}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Cumulative Contract Value
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Recurring (MRR)
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(activeMRR)}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Recurring Retainers
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs, Product Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl w-fit">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTab === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Accounts ({customers.length})
            </button>
            <button
              onClick={() => setSelectedTab("active")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTab === "active"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setSelectedTab("prospects")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTab === "prospects"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Prospects ({prospectCount})
            </button>
          </div>

          {/* Product Dropdown */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm font-medium"
          >
            <option value="all">All Products</option>
            {productOptions.filter((p) => p !== "all").map((prod) => (
              <option key={prod} value={prod}>
                Product: {prod}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, product, contact..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Customer List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card/40">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No accounts found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No customers matched "${searchQuery}". Try a different search term.`
                : "Get started by adding your first customer or prospect lead."}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Customer</span>
            </Button>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const primaryContact =
              customer.contacts.find((c) => c.isPrimary) || customer.contacts[0];
            const setup = customer.financials.setupFee || 0;
            const recurring = customer.financials.recurringAmount || 0;
            const cycle = customer.financials.billingCycle;

            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="group block"
              >
                <Card className="h-full hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 bg-card overflow-hidden">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {customer.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="purple" className="text-[10px] font-semibold py-0">
                            {customer.primaryProduct || "GovStax"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            • {customer.industry || "B2B Account"}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          customer.status === "active"
                            ? "success"
                            : customer.status === "proposal_sent"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px] uppercase font-bold shrink-0"
                      >
                        {customer.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    {/* Primary Contact */}
                    {primaryContact && (
                      <div className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1">
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>{primaryContact.name}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {primaryContact.title}
                          </span>
                        </div>
                        {primaryContact.email && (
                          <div className="text-muted-foreground flex items-center gap-1.5 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{primaryContact.email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                          Year 1 Total
                        </span>
                        <span className="font-bold text-foreground">
                          {formatCurrency(customer.financials.totalContractValue)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                          {setup > 0 ? `Build: ${formatCurrency(setup)} + Retainer` : "Retainer / Renewal"}
                        </span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(recurring)}/{cycle === "annually" ? "yr" : cycle === "monthly" ? "mo" : "qtr"}
                        </span>
                      </div>
                    </div>

                    {/* Footer tags */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {customer.address?.city
                            ? `${customer.address.city}, ${customer.address.state}`
                            : "Direct Client"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        <span>View 360</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
