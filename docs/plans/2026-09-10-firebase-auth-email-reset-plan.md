# Firebase Auth Email Reset & Whitelist Hardening Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement strict team email whitelisting and native Firebase Auth out-of-band email verification (`sendPasswordResetEmail` and `confirmPasswordReset`) for StaxHQ login and password reset.

**Architecture:** Restructure `TenantContext` to expose `sendResetEmail` and `confirmResetWithCode` backed by Firebase Auth and whitelist validation. Update `LoginPage` to replace open in-browser resets with email dispatch and incoming action code handling (`oobCode`).

**Tech Stack:** Next.js 15, React 19, Firebase Auth SDK (`firebase/auth`), Tailwind CSS, Lucide Icons.

---

### Task 1: Whitelist Guard & Firebase Auth Reset Service in TenantContext
**Files:**
- Modify: `src/lib/firebase/tenantContext.tsx`
- Modify: `src/lib/firebase/config.ts` (if needed)

**Steps:**
1. Import `sendPasswordResetEmail`, `confirmPasswordReset`, and `verifyPasswordResetCode` from `firebase/auth`.
2. Add `sendResetVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>` to `TenantContextType`.
3. Implement `sendResetVerificationEmail`:
   - Validate that the email is present in `teamMembers`. Reject any non-team email with `"Access Denied: This email address is not registered in the StaxHQ Team Directory."`.
   - Call `sendPasswordResetEmail(auth, normalizedEmail)`.
4. Add `confirmPasswordResetWithCode: (code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>`:
   - Call `confirmPasswordReset(auth, code, newPassword)`.
   - Update local state credentials and persist.

---

### Task 2: Update LoginPage UI for Email Verification & Action Code Handling
**Files:**
- Modify: `src/app/login/page.tsx`

**Steps:**
1. Detect URL parameters `mode=resetPassword` and `oobCode=...` using `useSearchParams()`.
2. When on the "Reset Password" tab:
   - Form shows "Team Member Email Address" input and "Send Secure Reset Link to Inbox" button.
   - On submission: Calls `sendResetVerificationEmail(email)`.
   - On success: Replaces the form with a confirmation state:
     > *"Check your inbox! We've sent a secure reset link to `[email]`. Click the link in your email to choose a new password."*
3. When URL contains an active `oobCode` (user clicked the link in their email):
   - Renders a secure "Set Your New Password" form (New Password + Confirm Password).
   - On submission: Calls `confirmPasswordResetWithCode(oobCode, newPassword)` and logs the user in.
4. Keep the quick access drawer for authorized executive accounts.

---

### Task 3: Build Verification & Deployment Rollout
**Files:**
- Run: `npm run build`
- Git Commit & Push to `origin main`
