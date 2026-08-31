"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Crown, 
  CheckCircle2,
  Building2,
  Layers
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo, isAuthenticated, teamMembers } = useTenant();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    const success = login(email, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Please check your email.");
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (targetEmail: string) => {
    setIsLoading(true);
    login(targetEmail);
    router.push("/dashboard");
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    loginAsDemo();
    router.push("/dashboard");
  };

  // Find sample admin and employee
  const sampleAdmin = teamMembers.find((m) => m.role === "admin") || {
    displayName: "Admin Operator",
    email: "admin@staxify.com",
    role: "admin",
  };

  const sampleEmployee = teamMembers.find((m) => m.role === "employee") || {
    displayName: "Marcus Vance",
    email: "marcus@staxify.com",
    role: "employee",
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-xl shadow-indigo-500/10 mx-auto">
            <img
              src="/stax-logo.png"
              alt="Staxify"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span>Staxify</span>
            </h1>
            <p className="text-xs uppercase font-bold tracking-widest text-indigo-400 mt-0.5">
              Layered Intelligence
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Internal Enterprise CRM, Contracts & Financial Operations
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-7 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                Email Address
              </Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@staxify.com"
                  className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                  Password
                </Label>
                <span className="text-[11px] text-slate-500">Default: any password</span>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all gap-2"
            >
              <span>{isLoading ? "Signing In..." : "Sign In to Workspace"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick-Access Sign In Pills */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Access
              </span>
              <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                Fast Switch
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin(sampleAdmin.email)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    <Crown className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white">
                      Sign In as Admin
                    </p>
                    <p className="text-[10px] text-indigo-300 truncate">
                      {sampleAdmin.email} • Full Access & Financials
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Employee Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin(sampleEmployee.email)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white">
                      Sign In as Employee
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {sampleEmployee.email} • Operational Access
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Demo Mode Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-200 group-hover:text-white">
                      Launch Client Demo Sandbox
                    </p>
                    <p className="text-[10px] text-emerald-300">
                      Isolated Presentation Mode • Town of Rehobeth
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Encrypted Session • Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
}
