# Financial Ledger, Paid-Invoice Revenue Engine, and Invoice Operations Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement strict revenue tracking driven by actual PAID invoices, eliminate synthetic MRR averages, add invoice deletion capabilities, embed official letterhead remittance & online payment links into invoice emails, and support $0/free beta tester client tracking.

**Architecture:** Centralize financial math in a dedicated calculation helper module (`financialCalculations.ts`), update Dashboard, Customers, and Financials views to reflect actual collected cash vs recurring commitments, wire up full deletion actions in state and UI, and add public `/pay/[invoiceNumber]` letterhead portal.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, Lucide Icons, jsPDF, LocalStorage / Firebase Context.

---

### Task 1: Centralized Financial Calculation Engine & Precision Logic
**Files:**
- Create: `src/lib/financials/financialCalculations.ts`

**Steps:**
1. Create calculation functions: `calculatePaidCashToDate`, `calculateAnnualARR`, `calculateMonthlyMRR`, `calculatePendingReceivables`, `calculateCustomerPaidTotal`.
2. Ensure `calculateMonthlyMRR` strictly filters for `billingCycle === "monthly"` and active accounts without dividing annual sums by 12.

---

### Task 2: Executive Dashboard & Customer Page Metric Overhauls
**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/app/(app)/customers/page.tsx`
- Modify: `src/app/(app)/customers/[id]/page.tsx`

**Steps:**
1. Update Executive Dashboard KPI cards:
   - Active Accounts
   - Total Collected to Date (Realized Cash from Paid Invoices)
   - Annual Recurring (ARR)
   - Monthly Recurring (MRR) (Zero averaging)
2. Update Customer page and Customer Details views with paid ledger stats and Beta/Pilot indicators.

---

### Task 3: Financial Hub (`/financials`) Metrics & Invoice Deletion Actions
**Files:**
- Modify: `src/app/(app)/financials/page.tsx`
- Modify: `src/components/financials/InvoiceReviewModal.tsx`

**Steps:**
1. Add Delete Invoice button with confirmation modal on table rows and in the review modal.
2. Update Revenue & Financial Metrics tab with Realized Cash Collected, Pending Invoices, ARR, and MRR.

---

### Task 4: Online Payment Portal & Gmail Letterhead Integration
**Files:**
- Create: `src/app/(public)/pay/[invoiceNumber]/page.tsx`
- Modify: `src/components/financials/InvoiceReviewModal.tsx`

**Steps:**
1. Build public `/pay/[invoiceNumber]` landing page with official Staxify letterhead, itemized deliverables, and mock card/ACH checkout that updates the invoice to `paid`.
2. Embed the online pay link and remittance instructions into the Gmail body.
3. Automatically download the letterhead PDF when clicking Send so the user can drag/attach it to Gmail.

---

### Task 5: Beta / Free Tier Account Support
**Files:**
- Modify: `src/components/customers/CustomerModal.tsx`

**Steps:**
1. Add quick toggle for "Beta Tester / Free Tier ($0)" to cleanly support non-billing app testers.

---

### Task 6: Verification & Build Validation
**Files:**
- Test with `npm run build`
