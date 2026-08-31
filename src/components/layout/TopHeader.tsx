"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Shield, 
  Search, 
  Plus, 
  Building2, 
  Layers, 
  ArrowLeftRight,
  Eye,
  CheckCircle2
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserRole } from "@/types/crm";

interface TopHeaderProps {
  onNewCustomerClick?: () => void;
  onNewDocumentClick?: () => void;
}

export function TopHeader({ onNewCustomerClick, onNewDocumentClick }: TopHeaderProps) {
  const { 
    isDemoMode, 
    toggleDemoMode, 
    activeOrg, 
    currentRole, 
    setCurrentRole,
    resetDemoData 
  } = useTenant();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: Organization Title & Current Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{activeOrg.name}</span>
          </span>
          {isDemoMode ? (
            <Badge variant="success" className="gap-1 text-[11px] py-0.5">
              <Sparkles className="h-3 w-3" />
              Demo Environment
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] py-0.5 text-muted-foreground">
              Production Company
            </Badge>
          )}
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Toggle Switcher */}
        <button
          onClick={toggleDemoMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-sm ${
            isDemoMode
              ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700"
              : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
          }`}
          title={isDemoMode ? "Exit Demo Mode and return to internal company CRM" : "Switch to safe Demo Sandbox for client presentations"}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>{isDemoMode ? "Exit Demo Mode" : "Switch to Demo Mode"}</span>
        </button>

        {/* Reset Demo Data Button if in Demo Mode */}
        {isDemoMode && (
          <button
            onClick={() => {
              resetDemoData();
              alert("Demo dataset has been reset to default mock accounts.");
            }}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline decoration-dotted"
          >
            Reset Demo Data
          </button>
        )}

        {/* Permission Preview Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-indigo-500" />
            <span className="capitalize">View: {currentRole}</span>
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-xl z-50 p-1.5 animate-in fade-in-0 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Simulate Role
              </div>
              <button
                onClick={() => {
                  setCurrentRole("admin");
                  setRoleMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-left ${
                  currentRole === "admin"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span>Admin (Full Access)</span>
                {currentRole === "admin" && <CheckCircle2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => {
                  setCurrentRole("employee");
                  setRoleMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-left ${
                  currentRole === "employee"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span>Employee (No Admin/Fin)</span>
                {currentRole === "employee" && <CheckCircle2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
}
