# Bank Statements, Expense Ingestion & Owner Draws Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a native Banking, Expense Ingestion, Recurring Vendor Burn & Partner Draw Ledger into Staxify's `Financials & Revenue` hub, replacing the need for QuickBooks.

**Architecture:** Extend CRM types with `BankTransaction`, implement CSV ingestion/parsing engine with smart pattern auto-categorization, auto-route withdrawals to `owner_draw`, integrate into `tenantContext.tsx` with localStorage persistence, and add 3 new tabs/views in `/financials` (Bank Ledger, Vendor Burn, Partner Draws & P&L Tax Export).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Lucide React, Radix UI dialogs/dropdowns, HTML5 file upload parser, jsPDF for tax exports.

---

### Task 1: Type Definitions & Seed Data
**Files:**
- Modify: `src/types/crm.ts`
- Modify: `src/lib/demo/seedData.ts`

**Step 1: Add Bank Transaction & Category Types**
Add `ExpenseCategory`, `TransactionType`, `BankTransaction`, and `PartnerEquitySummary` in `src/types/crm.ts`.

**Step 2: Add Seed Bank Transactions**
Add `initialBankTransactions` and `demoBankTransactions` in `src/lib/demo/seedData.ts` with real SaaS vendors (OpenAI, Vercel, GitHub, Google Workspace, AWS, Alabama SOS) and Partner Owner Draws.

**Step 3: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 2: State Management & CSV Ingestion Engine
**Files:**
- Create: `src/lib/financials/bankParser.ts`
- Modify: `src/lib/firebase/tenantContext.tsx`

**Step 1: Build CSV Parser & Auto-Categorization Helper**
Create `src/lib/financials/bankParser.ts`:
- Parses CSV text handling multiple bank formats (Date, Description, Amount / Inflow / Outflow).
- Pattern matches descriptions to auto-assign categories (OpenAI -> `ai_apis`, Vercel -> `cloud_infra`, etc.).
- Default rule: Unspecified withdrawals / transfers auto-route to `owner_draw`.

**Step 2: Wire State & Mutations into TenantContext**
Add state variables:
- `primaryBankTransactions`, `demoBankTransactionsState`
- `bankTransactions: BankTransaction[]`
- `importBankTransactions(transactions: BankTransaction[])`
- `updateBankTransaction(id: string, updates: Partial<BankTransaction>)`
- `deleteBankTransaction(id: string)`
- `addBankTransaction(tx: Omit<BankTransaction, "id" | "orgId" | "importedAt">)`

**Step 3: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 3: Bank Statement Upload & Transaction Ledger Component
**Files:**
- Create: `src/components/financials/BankStatementUploaderModal.tsx`
- Create: `src/components/financials/BankTransactionsLedger.tsx`

**Step 1: Build Bank Statement Uploader Modal**
- File drag-and-drop zone with CSV preview, column detection, and 1-click "Load Sample Bank Export".
- Instant parse & import with progress feedback.

**Step 2: Build Bank Transactions Ledger Component**
- Filter by Category (Owner Draw, Cloud, AI, Software, Legal, Inflow), Month/Date, and Search.
- 1-Click inline category dropdown switcher on any transaction row.
- Partner assignment dropdown for any transaction marked as Owner Draw.
- Manual transaction adder for cash/direct transfers.

**Step 3: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 4: Vendor SaaS Burn & Tech Stack Tracker Component
**Files:**
- Create: `src/components/financials/VendorSaaSBreakdown.tsx`

**Step 1: Build Vendor SaaS Breakdown Component**
- Auto-groups all recurring debit transactions by clean payee name.
- Calculates Total Monthly SaaS Burn and category distribution (AI APIs vs Hosting vs Office).
- Displays cards for each active vendor with last charge, frequency, and trend.

**Step 2: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 5: Partner Equity Draw Ledger & Executive P&L Tax Export
**Files:**
- Create: `src/components/financials/PartnerDrawsAndPnL.tsx`
- Create: `src/lib/financials/taxReportGenerator.ts`

**Step 1: Build Partner Draws & P&L Component**
- Partner Distribution Cards (Josh YTD Draws vs Admin/Partner YTD Draws).
- Equity distribution meter (50/50 balance status).
- Executive P&L Summary Table: Total Realized Inflows - Total OpEx - Total Draws = Net Retained Cash.
- 1-Click "Export Tax Report (PDF & CSV)" button for CPA.

**Step 2: Build Tax Report PDF/CSV Generator**
- Generates formatted PDF/CSV statement of P&L breakdown and partner draw schedule.

**Step 3: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 6: Financials Page Integration & Production Build
**Files:**
- Modify: `src/app/(app)/financials/page.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx` (optional quick cash pulse widget)

**Step 1: Update `/financials` Tabs Layout**
Add tabs for:
- `Invoicing & A/R`
- `Bank Transactions & Spending`
- `Vendor SaaS Burn`
- `Partner Draws & P&L`

**Step 2: Verification**
Run: `npm run build`
Expected: Build passes with zero errors and `/financials` route generated cleanly.
