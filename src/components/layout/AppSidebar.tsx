"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  Settings, 
  Layers, 
  ShieldCheck,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

const navigationItems = [
  {
    name: "Executive Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers & Pipeline",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Documents & Contracts",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "Calendar & Schedule",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Financials & Revenue",
    href: "/financials",
    icon: DollarSign,
  },
  {
    name: "Admin & Settings",
    href: "/admin",
    icon: Settings,
    adminOnly: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isDemoMode, activeOrg, currentRole, customers, contracts } = useTenant();

  return (
    <aside className="w-64 bg-card border-r border-border/80 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden shrink-0">
            <img
              src="/stax-logo.png"
              alt="Staxify"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                {activeOrg.shortName || "Staxify"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">
              Layered Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Demo Mode Notice Badge */}
      {isDemoMode && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Demo Mode Active</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
            SAFE
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {navigationItems.map((item) => {
          if (item.adminOnly && currentRole !== "admin") return null;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{item.name}</span>
              </div>
              {item.href === "/customers" && customers.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {customers.length}
                </span>
              )}
              {item.href === "/documents" && contracts.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {contracts.length}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Summary Card */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-muted/40 border border-border/60">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 font-medium">
          <span>Active Accounts</span>
          <span className="font-bold text-foreground">{customers.filter(c => c.status === 'active').length}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Signed Contracts</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {contracts.filter(c => c.status === 'signed').length}
          </span>
        </div>
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-border/60 flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {isDemoMode ? "DM" : "HQ"}
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-foreground leading-tight">
              {isDemoMode ? "Demo Mode" : "Stax Operator"}
            </div>
            <div className="text-[11px] text-muted-foreground capitalize flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-indigo-500" />
              <span>{currentRole}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
