# Notifications, Currency Precision, Annual ARR, and Phone Auto-Format Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Address 4 specific UX and formatting refinements requested by the user:
1. Notification bell dropdown popover that allows reading/interacting with alerts, with immediate removal upon marking as read.
2. Exact currency formatting (preserving decimals and preventing number rounding).
3. Distinguish Annual Recurring Revenue (ARR) from Monthly (MRR) across dashboards and KPIs so annual retainers are never mislabeled as MRR.
4. Auto-format 10-digit phone numbers as `(XXX) XXX-XXXX` on input without requiring manual punctuation.

---

### Task 1: Phone Auto-Formatter & Exact Currency Helper
**Files:**
- Modify: `src/lib/utils.ts`

**Details:**
- Update `formatCurrency(amount)` to preserve exact fractional cents (`minimumFractionDigits: hasDecimals ? 2 : 0, maximumFractionDigits: 2`).
- Add `formatPhoneNumber(value)` to automatically format 10 digits into `(XXX) XXX-XXXX`.

---

### Task 2: Phone Input & Exact Decimal Precision in CustomerModal
**Files:**
- Modify: `src/components/customers/CustomerModal.tsx`

**Details:**
- Hook `formatPhoneNumber` into `contactPhone` `onChange`.
- Set `step="any"` and handle exact decimal values on `setupFee`, `recurringAmount`, and `totalValue` inputs.

---

### Task 3: Annual Retainers vs MRR on Dashboard & Financials
**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/app/(app)/financials/page.tsx`

**Details:**
- Dynamically display **Annual Recurring (ARR)** vs **Monthly Recurring (MRR)**.
- For annual accounts (e.g. Town of Rehobeth $4,912/yr), display as **Annual Retainers (ARR)** ($4,912/yr) instead of forcing division by 12 into MRR.

---

### Task 4: Notification Bell Popover & Auto-Dismiss on Mark Read
**Files:**
- Modify: `src/components/notifications/NotificationBell.tsx`
- Modify: `src/components/notifications/NotificationsDrawer.tsx`

**Details:**
- Restore the clean, interactive popover dropdown from the Bell icon in the top header.
- Allow reading the full message, deep-linking to the customer/contract, and testing audio chime.
- Filter to active/unread notifications so when "Mark as Read" or "Dismiss" (or "Mark All as Read") is clicked, it immediately disappears from the active list.

---

### Task 5: Verification & Build Validation
- Run `npm run build` to verify type safety and page generation.
