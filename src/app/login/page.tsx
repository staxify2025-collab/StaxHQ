"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  UserCheck,
  Send,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthViewMode = "signin" | "requestReset" | "confirmReset";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    login, 
    sendResetVerificationEmail, 
    confirmPasswordResetWithCode, 
    teamMembers 
  } = useTenant();

  const [mode, setMode] = useState<AuthViewMode>("signin");
  const [email, setEmail] = useState("jeff@staxifytech.com");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oobCode, setOobCode] = useState<string>("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  // Check for incoming Firebase Auth action parameters in URL (?mode=resetPassword&oobCode=...)
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    const code = searchParams.get("oobCode");

    if (urlMode === "resetPassword" && code) {
      setMode("confirmReset");
      setOobCode(code);
      setSuccessMessage("Security link verified. Please choose a new password for your account.");
    }
  }, [searchParams]);

  // Standard Login Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!password) {
      setError("Please enter your account password.");
      return;
    }

    setIsLoading(true);
    const result = login(trimmedEmail, password);

    if (result.success) {
      setSuccessMessage("Authentication successful! Entering workspace...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    } else {
      setError(result.error || "Invalid credentials. Please verify your credentials and try again.");
      setIsLoading(false);
    }
  };

  // Step 1: Send Out-of-Band Reset Link to Verified Inbox (with Strict Whitelist Check)
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your registered team email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendResetVerificationEmail(trimmedEmail);

      if (res.success) {
        setEmailSentTo(trimmedEmail);
        setSuccessMessage(
          res.message || 
          `A secure verification link has been dispatched to ${trimmedEmail}.`
        );
      } else {
        setError(
          res.error || 
          `Access Denied: "${trimmedEmail}" is not an authorized team member. Contact your workspace administrator for access.`
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to initiate password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Complete Password Reset using Secure Action Code (oobCode)
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await confirmPasswordResetWithCode(oobCode, newPassword);

      if (res.success) {
        setSuccessMessage("Password successfully updated! Signing you in...");
        const targetEmail = res.email || email;
        const loginRes = login(targetEmail, newPassword);
        
        setTimeout(() => {
          if (loginRes.success) {
            router.push("/dashboard");
          } else {
            setMode("signin");
            setPassword(newPassword);
            setIsLoading(false);
          }
        }, 700);
      } else {
        setError(res.error || "Failed to update password. The link may have expired.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during password update.");
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    
    const result = login(quickEmail, quickPass);
    if (result.success) {
      setSuccessMessage(`Signing in as ${quickEmail}...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    } else {
      setError(result.error || "Failed to sign in.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

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

        {/* Auth Mode Toggle Tabs (Only shown when not confirming a link) */}
        {mode !== "confirmReset" && (
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setSuccessMessage("");
                setEmailSentTo(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "signin"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("requestReset");
                setError("");
                setSuccessMessage("");
                setEmailSentTo(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "requestReset"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Reset Password</span>
            </button>
          </div>
        )}

        {/* Main Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-7 shadow-2xl space-y-5">
          {/* Success Banner */}
          {successMessage && !emailSentTo && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex flex-col gap-2 animate-in fade-in-50">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("requestReset");
                    setError("");
                    setEmailSentTo(null);
                  }}
                  className="text-left text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold pl-6"
                >
                  Forgot your password? Request a secure reset link ➔
                </button>
              )}
            </div>
          )}

          {/* 1. SIGN IN VIEW */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  Email Address / Username
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="jeff@staxifytech.com"
                    className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("requestReset");
                      setError("");
                      setSuccessMessage("");
                      setEmailSentTo(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="••••••••"
                    className="pl-9 pr-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none p-0.5 rounded"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all gap-2 mt-2"
              >
                <span>{isLoading ? "Signing In..." : "Sign In to Workspace"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* 2. REQUEST RESET VIEW (SEND EMAIL TO INBOX) */}
          {mode === "requestReset" && (
            <div>
              {emailSentTo ? (
                /* Sent Confirmation Screen */
                <div className="space-y-4 text-center py-2 animate-in fade-in-50">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/10">
                    <Send className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white">
                      Check Your Email Inbox
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      A single-use, cryptographically signed verification link has been sent to:
                    </p>
                    <p className="text-xs font-mono font-semibold text-indigo-300 bg-slate-950/70 py-1.5 px-3 rounded-lg border border-slate-800 inline-block">
                      {emailSentTo}
                    </p>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 text-left space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Security Verification Policy</span>
                    </div>
                    <p className="leading-relaxed">
                      To prevent unauthorized account takeovers, passwords can only be changed by opening the verification link sent directly to your registered inbox.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEmailSentTo(null)}
                      className="w-full h-9 rounded-xl border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300 text-xs font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      <span>Send to Another Email Address</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setEmailSentTo(null);
                      }}
                      className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                /* Request Form */
                <form onSubmit={handleSendResetEmail} className="space-y-4">
                  <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-indigo-300 space-y-1">
                    <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Authorized Team Verification</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Enter your authorized team email. A secure, single-use authentication link will be dispatched to your inbox.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reset-email" className="text-xs font-semibold text-slate-300">
                      Team Member Email Address
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="jeff@staxifytech.com"
                        className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all gap-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isLoading ? "Verifying & Sending..." : "Send Secure Reset Link to Inbox"}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setMode("signin");
                        setError("");
                      }}
                      className="w-full h-9 rounded-xl border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Cancel & Back to Sign In
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. CONFIRM RESET VIEW (WHEN ARRIVING WITH ACTION CODE FROM EMAIL) */}
          {mode === "confirmReset" && (
            <form onSubmit={handleConfirmReset} className="space-y-4 animate-in fade-in-50">
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-300">
                <span className="font-semibold text-emerald-200">Email Verified:</span> Your identity has been verified via your email link. Choose a new password to finalize.
              </div>

              <div>
                <Label htmlFor="new-password" className="text-xs font-semibold text-slate-300">
                  New Password
                </Label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="At least 6 characters"
                    className="pl-9 pr-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none p-0.5 rounded"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-xs font-semibold text-slate-300">
                  Confirm New Password
                </Label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Re-enter your new password"
                    className="pl-9 pr-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none p-0.5 rounded"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/25 transition-all gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{isLoading ? "Finalizing Update..." : "Update Password & Sign In"}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                  className="w-full h-9 rounded-xl border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel & Back to Sign In
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Access & Recovery Drawer */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-3.5 space-y-2.5">
          <button
            type="button"
            onClick={() => setShowQuickAccess(!showQuickAccess)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Authorized Team Members & 1-Click Entry</span>
            </div>
            <span className="text-[10px] text-slate-500 underline">
              {showQuickAccess ? "Hide" : "Show Fast Login"}
            </span>
          </button>

          {showQuickAccess && (
            <div className="space-y-2 pt-2 border-t border-slate-800 animate-in fade-in-50">
              <p className="text-[11px] text-slate-400">
                Click any profile to sign in with authorized executive credentials:
              </p>
              
              <div className="grid grid-cols-1 gap-1.5">
                {/* Jeff */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("jeff@staxifytech.com", "Onesite@1219")}
                  className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-left transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-200">
                        Jeff (Executive Admin)
                      </div>
                      <div className="text-[10px] text-indigo-300 font-mono">
                        jeff@staxifytech.com
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/30">
                    1-Click Sign In ➔
                  </span>
                </button>

                {/* Staxify2025 */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("staxify2025@staxifytech.com", "admin123")}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white">
                        Staxify2025 (Admin)
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        staxify2025@staxifytech.com
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700">
                    1-Click Sign In ➔
                  </span>
                </button>

                {/* Sarah Jenkins */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("sarah@staxhq.com", "password123")}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-300 group-hover:text-white">
                        Sarah Jenkins (Admin)
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        sarah@staxhq.com
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded border border-slate-700">
                    1-Click Sign In ➔
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Restricted Access • Authorized Team Members Only</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-slate-950" />}>
      <LoginContent />
    </Suspense>
  );
}
