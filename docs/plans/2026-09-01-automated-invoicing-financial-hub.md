# Automated Invoicing, Renewal Tracker & Financial Hub Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build an automated customer invoicing and renewal tracking system with background draft triggers, 1-click Gmail dispatch from `jeff@staxifytech.com`, official invoice PDF generation with `Remit to Staxify LLC`, Master Template dropdown selector, strict audio chime filtering, and decimal math precision.

**Architecture:** Add `Invoice` types and renewal dates in `CustomerFinancials`. Update `notificationService.ts` to restrict audio chimes to `contract_signed`. Implement background automated renewal monitor in `tenantContext.tsx`. Add `generateInvoicePdf` in `pdfGenerator.ts`. Rebuild `src/app/(app)/financials/page.tsx` with dedicated Invoicing & Renewal Center, timeline, and `InvoiceReviewModal.tsx`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, jsPDF, Web Audio API, Lucide Icons.

---

### Task 1: Data Model, Invoicing Types & Decimal Math Precision Fixes
**Files:**
- Modify: `src/types/crm.ts`
- Modify: `src/components/customers/CustomerModal.tsx`

**Details:**
- Add `renewalDayOfMonth?: number`, `nextRenewalDate?: number`, `autoInvoicing?: boolean` to `CustomerFinancials`.
- Define `Invoice`, `InvoiceLineItem`, and `InvoiceStatus` types.
- In `CustomerModal.tsx`, fix floating-point math: `Math.round((setupNum + recurringNum) * 100) / 100` and add Renewal Day input & Next Renewal Date picker.

---

### Task 2: Audio Tones Filter & Dropdown Master Template Selector
**Files:**
- Modify: `src/lib/notifications/notificationService.ts`
- Modify: `src/lib/firebase/tenantContext.tsx`
- Modify: `src/components/documents/DocumentCreatorModal.tsx`

**Details:**
- Ensure `playNotificationChime()` ONLY executes when `type === 'contract_signed'`.
- In `DocumentCreatorModal.tsx`, replace the template button grid with a clean searchable **Dropdown Selector** with category/product tags and live template preview.

---

### Task 3: Invoicing State, Seed Data & Automated Renewal Tracker
**Files:**
- Modify: `src/lib/demo/seedData.ts`
- Modify: `src/lib/firebase/tenantContext.tsx`

**Details:**
- Add `invoices`, `addInvoice`, `updateInvoice`, `deleteInvoice`, and `generateInvoiceForCustomer` to `TenantContext`.
- Seed initial customer invoices for Town of Rehobeth and Metro Utility.
- Add 30-second background checker in `tenantContext.tsx`:
  - 10 days prior (monthly) / 30 days prior (annual) ➔ Auto-generates Draft Invoice & Admin Alert.
  - 5 days prior (monthly) / 7 days prior (annual) if unpaid ➔ Auto-flags reminder.
  - Due date if unpaid ➔ Auto-flags Overdue notice.

---

### Task 4: Official Staxify Invoice PDF Generator Engine
**Files:**
- Modify: `src/lib/pdf/pdfGenerator.ts`

**Details:**
- Implement `generateInvoicePdf({ invoice, customer, org })`:
  - Official `Staxify` letterhead and subtle cyan-indigo-violet brand watermark.
  - Metadata block (`Invoice #`, `Issue Date`, `Due Date`, `Payment Terms`).
  - Bill-To and Product platform breakdown.
  - Line items table with Setup Fee, Software Retainer, Subtotal, and Total Balance.
  - Official Remittance footer: `Remit to: Staxify LLC` with ACH/Wire info and mailing address.
  - Verified Green "PAID IN FULL" badge when `status === 'paid'`.

---

### Task 5: Financial Hub (`/financials`) & Invoice Review/Send Modal
**Files:**
- Create: `src/components/financials/InvoiceReviewModal.tsx`
- Modify: `src/app/(app)/financials/page.tsx`

**Details:**
- Build `InvoiceReviewModal.tsx`:
  - Line item editor & payment terms review.
  - 1-Click **"✉️ Send with Gmail (jeff@staxifytech.com)"**.
  - 1-Click **"Mark as Paid"** and **"Download PDF"**.
- Rebuild `/financials` into 3 powerful tabs:
  1. **Invoicing & Billing Action Queue** (Drafts Awaiting Review, Sent/Pending, Overdue, Paid).
  2. **Renewal Calendar & Timeline** (Upcoming renewal schedule).
  3. **Revenue & ARR/MRR Metrics**.

---

### Task 6: Verification & Build Validation
- Run `npm run build` and verify 0 errors.
