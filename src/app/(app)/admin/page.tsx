"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Users, 
  Save, 
  Check, 
  Sliders,
  FileCheck
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { appConfig } from "@/config/appConfig";
import { getInitials } from "@/lib/utils";

export default function AdminPage() {
  const { 
    activeOrg, 
    updateOrgSettings, 
    teamMembers, 
    currentRole, 
    resetDemoData, 
    isDemoMode,
    toggleDemoMode 
  } = useTenant();

  const [name, setName] = useState(activeOrg.name);
  const [shortName, setShortName] = useState(activeOrg.shortName || "");
  const [address, setAddress] = useState(activeOrg.address || "");
  const [phone, setPhone] = useState(activeOrg.phone || "");
  const [email, setEmail] = useState(activeOrg.email || "");
  const [watermark, setWatermark] = useState(activeOrg.defaultWatermark || "CONFIDENTIAL");
  const [isSaved, setIsSaved] = useState(false);

  if (currentRole === "employee") {
    return (
      <div className="py-16 text-center space-y-3">
        <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Admin Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          You are currently in Employee view. Only Administrators have permission to modify system configuration and company branding.
        </p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgSettings({
      name,
      shortName,
      address,
      phone,
      email,
      defaultWatermark: watermark,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          <span>Admin & Organization Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize company headers, printable watermarks, team permissions, and multi-tenant demo controls.
        </p>
      </div>

      {/* Organization Branding Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border/80">
          <CardHeader className="p-6 pb-4 border-b border-border/60">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span>Company Branding & Official Headers</span>
            </CardTitle>
            <CardDescription className="text-xs">
              These details appear at the top of generated PDFs, printed client agreements, and emails.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cName">Company / Platform Legal Name *</Label>
                <Input
                  id="cName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. StaxHQ"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sName">Display / Short Name</Label>
                <Input
                  id="sName"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. Stax"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="cAddress">Headquarters Address</Label>
                <Input
                  id="cAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="100 Innovation Way, Suite 400, Birmingham, AL 35203"
                />
              </div>

              <div>
                <Label htmlFor="cPhone">Official Phone Number</Label>
                <Input
                  id="cPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(205) 555-0199"
                />
              </div>

              <div>
                <Label htmlFor="cEmail">Billing & Operations Email</Label>
                <Input
                  id="cEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operations@staxhq.com"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="cWatermark">Default PDF & Print Watermark Stamp</Label>
                <select
                  id="cWatermark"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {appConfig.brand.watermarkOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-border/60">
              <span className="text-xs text-muted-foreground">
                Changes apply instantly across all print templates.
              </span>
              <Button type="submit" variant="gradient" className="gap-2">
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Company Settings</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Team Member Roles */}
      <Card className="border-border/80">
        <CardHeader className="p-6 pb-4 border-b border-border/60">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span>Team Members & Permission Roles</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Admin has full system control; Employee has access to clients, notes, and documents.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.uid}
              className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center">
                  {getInitials(member.displayName)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{member.displayName}</p>
                  <p className="text-muted-foreground text-[11px]">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold uppercase text-[10px]">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Multi-Tenant Demo Sandbox Controls */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="p-6 pb-4 border-b border-emerald-500/20">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <span>Multi-Tenant Demo Sandbox</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Control the safe isolated sandbox for live client presentations without exposing your company data.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {isDemoMode ? "Currently in Demo Mode" : "Currently in Company Mode"}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              Resetting demo data repopulates Town of Rehobeth, sample signed contracts, and dummy financials.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => {
                resetDemoData();
                alert("Demo sandbox data successfully refreshed.");
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-emerald-500/40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Demo Fixtures</span>
            </Button>

            <Button
              onClick={toggleDemoMode}
              variant="gradient"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <span>{isDemoMode ? "Exit to Company Mode" : "Enter Demo Mode"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
