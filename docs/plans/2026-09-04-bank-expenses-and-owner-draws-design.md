# Bank Statements, Expense Ingestion & Partner Draw Hub Design

## 1. Overview & Problem Statement
Staxify currently manages invoicing and accounts receivable, but lacks an integrated operating expense and banking ledger. Instead of adopting a cumbersome and costly external accounting software (e.g. QuickBooks), Staxify will provide a native **Banking, Expense Ingestion, Recurring Vendor Burn & Partner Draw Ledger** integrated directly into the `Financials & Revenue` module.

---

## 2. Key Architecture & Business Rules

### Rule 1: Withdrawal & Owner Draw Handling
* Standard bank statements do not explicitly label transfers as "Owner Draw".
* **Default Classification:** All debit withdrawals, partner transfers, and outgoing cash distributions will automatically route into the **Owner Draw / Partner Distribution** category.
* Users can easily assign draws to specific partners (e.g., `JOSH`, `Partner / Admin`, or `50/50 Split`) and attach memos in 1 click.

### Rule 2: Automatic Vendor SaaS Burn Detection
* No separate manual vendor entry required.
* The system scans bank transactions for known recurring software and infrastructure payees (e.g., OpenAI, Vercel, Google Workspace, GitHub, AWS, Cursor, Twilio, Supabase) and automatically aggregates monthly SaaS burn metrics.

### Rule 3: Tax & CPA Ready P&L Summary
* Real-time calculation:
  $$\text{Realized Cash Inflows (Deposits)} - \text{Operating Expenses (OpEx)} - \text{Owner Draws} = \text{Net Retained Cash}$$
* Exportable to CSV / PDF formatted for Schedule K-1 / Form 1065 / 1120S annual tax prep.

---

## 3. Data Model (`src/types/crm.ts`)

```typescript
export type ExpenseCategory = 
  | 'owner_draw' 
  | 'ai_apis' 
  | 'cloud_infra' 
  | 'dev_tools' 
  | 'legal_admin' 
  | 'contractors' 
  | 'office_travel' 
  | 'revenue_inflow' 
  | 'other';

export type TransactionType = 'debit' | 'credit';

export interface BankTransaction {
  id: string;
  orgId: string;
  date: number; // timestamp
  description: string;
  payeeClean: string; // e.g. "Vercel Inc." from "VERCEL* 1938489 CA"
  amount: number; // positive number
  type: TransactionType; // 'debit' (outflow) | 'credit' (inflow)
  category: ExpenseCategory;
  partnerName?: string; // e.g. "JOSH", "Admin Operator", "Split 50/50" for owner draws
  memo?: string;
  isRecurring?: boolean;
  importedAt: number;
  sourceFile?: string;
}

export interface PartnerEquitySummary {
  partnerName: string;
  totalDrawsYtd: number;
  drawCount: number;
  targetSharePercent?: number; // e.g. 50%
}
```

---

## 4. UI/UX Architecture & Tabs in Financials Hub

The `Financials & Revenue` page (`/financials`) will feature 4 cohesive tabs:

1. **Invoicing & Accounts Receivable (Existing)**
   - Draft, Sent, Paid, and Overdue invoice generator, renewal invoices, and direct payment links.

2. **Bank Transactions & Expense Stream (New)**
   - Monthly bank statement CSV uploader with drag-and-drop parsing.
   - Live transaction stream with search, category filtering, and 1-click category dropdowns.
   - Quick action to assign partner recipient to any draw.

3. **Vendor SaaS & Tech Stack Burn (New)**
   - Auto-detected recurring services (OpenAI, Vercel, Google Workspace, GitHub, etc.).
   - Monthly burn rate and breakdown by engineering vs office tools.

4. **Partner Draws & P&L Summary (New)**
   - Partner distribution ledger (Josh vs Admin/Partner YTD breakdown).
   - Equity distribution balance meter (e.g. 50/50 parity check).
   - Full P&L breakdown (Gross Inflows, OpEx by category, Draws, Net Retained).
   - 1-Click "Export Tax Report (CSV / PDF)" for CPA.

---

## 5. Seed Data & Bank Presets
To ensure day-one functionality without forcing immediate manual CSV uploads:
* Pre-load realistic transactions matching Staxify's actual stack:
  * Inflows: Municipal wire deposits (Town of Rehobeth, City of Dothan).
  * Outflows: OpenAI API, Vercel Pro, Google Workspace, GitHub Teams, Cursor, Alabama Secretary of State Annual Report, Partner Draws ($2,500 to Josh, $2,500 to Admin).
