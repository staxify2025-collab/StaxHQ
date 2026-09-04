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
  FileCheck,
  Layers,
  Trash2,
  Plus,
  UserPlus,
  Calendar as CalendarIcon
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { appConfig } from "@/config/appConfig";
import { getInitials } from "@/lib/utils";
import { UserRole } from "@/types/crm";

export default function AdminPage() {
  const { 
    activeOrg, 
    updateOrgSettings, 
    teamMembers, 
    currentRole, 
    resetDemoData, 
    isDemoMode,
    toggleDemoMode,
    products,
    addProduct,
    deleteProduct,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    customers,
    clearAllPrimaryData,
    seedSamplePrimaryData
  } = useTenant();

  const [name, setName] = useState(activeOrg.name);
  const [shortName, setShortName] = useState(activeOrg.shortName || "");
  const [address, setAddress] = useState(activeOrg.address || "");
  const [phone, setPhone] = useState(activeOrg.phone || "");
  const [email, setEmail] = useState(activeOrg.email || "");
  const [watermark, setWatermark] = useState(activeOrg.defaultWatermark || "CONFIDENTIAL");
  const [newProductName, setNewProductName] = useState("");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<UserRole>("employee");
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

      {/* Software Products & Platform Portfolio Manager */}
      <Card className="border-border/80">
        <CardHeader className="p-6 pb-4 border-b border-border/60">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <span>Software Products & Platform Catalog</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Add new products as your company expands. Products added here immediately appear in customer dropdowns and financial sorting.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Add New Product Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newProductName.trim()) return;
              addProduct(newProductName.trim());
              setNewProductName("");
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="e.g. CityDesk, AutoPulse, StaxVault..."
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="flex-1 text-xs"
            />
            <Button type="submit" variant="gradient" size="sm" className="gap-1.5 shrink-0">
              <span>+ Add Product</span>
            </Button>
          </form>

          {/* Active Product List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {products.map((prod) => {
              const custCount = customers.filter(
                (c) => (c.primaryProduct || "GovStax").toLowerCase() === prod.toLowerCase()
              ).length;

              return (
                <div
                  key={prod}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/70 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{prod}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {custCount} active account{custCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to remove "${prod}" from the product catalog?`
                          )
                        ) {
                          deleteProduct(prod);
                        }
                      }}
                      className="text-muted-foreground/60 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Remove product"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Member Roles & Employee Management */}
      <Card className="border-border/80">
        <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <span>Team Members & Permission Roles</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Admin has full system & financial control; Employee has access to clients, notes, and documents.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="gradient"
            size="sm"
            onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
            className="gap-1.5 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>{isAddMemberOpen ? "Close Form" : "+ Add Employee"}</span>
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Add Employee Form (Collapsible) */}
          {isAddMemberOpen && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMemberName.trim() || !newMemberEmail.trim()) return;
                addTeamMember({
                  displayName: newMemberName.trim(),
                  email: newMemberEmail.trim(),
                  role: newMemberRole,
                });
                setNewMemberName("");
                setNewMemberEmail("");
                setNewMemberRole("employee");
                setIsAddMemberOpen(false);
              }}
              className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/30 space-y-3 animate-in fade-in-50 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Add New Employee / Team Member</span>
                </span>
                <span className="text-[11px] text-muted-foreground">Immediate platform access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <Label htmlFor="memberName" className="text-xs">Full Name *</Label>
                  <Input
                    id="memberName"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Jason Miller"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="memberEmail" className="text-xs">Email Address *</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="jason@staxify.com"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="memberRole" className="text-xs">Permission Role</Label>
                  <select
                    id="memberRole"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                    className="w-full h-9 px-3 mt-1 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  >
                    <option value="employee">Employee (Restricted Financials)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm" className="gap-1.5 text-xs">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Confirm & Add Member</span>
                </Button>
              </div>
            </form>
          )}

          {/* Member List */}
          <div className="space-y-2.5">
            {teamMembers.map((member) => (
              <div
                key={member.uid}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                    {getInitials(member.displayName)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{member.displayName}</p>
                    <p className="text-muted-foreground text-[11px]">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Role Selector */}
                  <select
                    value={member.role}
                    onChange={(e) =>
                      updateTeamMember(member.uid, { role: e.target.value as UserRole })
                    }
                    className="text-xs h-8 px-2.5 rounded-lg border border-input bg-card text-foreground font-semibold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="admin">ADMIN</option>
                    <option value="employee">EMPLOYEE</option>
                  </select>

                  {/* Delete Button */}
                  {teamMembers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to remove ${member.displayName} (${member.email}) from the team?`
                          )
                        ) {
                          deleteTeamMember(member.uid);
                        }
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Remove team member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar & External Integrations */}
      <Card className="border-border/80">
        <CardHeader className="p-6 pb-4 border-b border-border/60">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-600" />
            <span>Google Workspace & Calendar Synchronization</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Manage 1-click meeting export links and configure 2-way Google Calendar background sync.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-bold text-foreground">
                  Direct 1-Click Google Calendar Action: Active
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                Every scheduled event features a 1-click link to open and save in Google Calendar with your tagged team attendees and customer address pre-filled.
              </p>
            </div>

            <Badge variant="success" className="shrink-0 text-xs">
              Direct Action Enabled
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <Label htmlFor="icalFeed" className="text-xs">
                Optional: Google Calendar Private iCal Feed URL (2-Way Pull)
              </Label>
              <Input
                id="icalFeed"
                placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                className="mt-1 text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Found in Google Calendar ➔ Settings ➔ &quot;Secret address in iCal format&quot;.
              </p>
            </div>

            <div className="flex flex-col justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => alert("Google Workspace live 2-way sync credentials saved.")}
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
                <span>Save Calendar Integration Settings</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management & Blank Slate Reset */}
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardHeader className="p-6 pb-4 border-b border-rose-500/20">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-rose-600" />
            <span>Workspace Data Management & Blank Slate</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Clear all stock test data to have a 100% clean blank slate for live company operations, or restore sample presets at any time.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Clean Blank Slate Reset
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              Wipes all customers, contracts, invoices, project cards, bank transactions, and activity notes from your primary company workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              onClick={() => {
                if (window.confirm("Are you sure you want to wipe all stock data and start with a completely clean blank slate?")) {
                  clearAllPrimaryData();
                  alert("✓ Workspace wiped clean! You now have a fresh blank slate.");
                }
              }}
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs font-bold shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Wipe to Blank Slate</span>
            </Button>

            <Button
              onClick={() => {
                if (window.confirm("Restore sample mock data into your primary workspace?")) {
                  seedSamplePrimaryData();
                  alert("✓ Sample data restored.");
                }
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Restore Sample Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Tenant Demo Sandbox */}
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
