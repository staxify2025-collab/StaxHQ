# Design Doc: Automated Invoicing, Renewal Tracker & Financial Hub

**Date:** 2026-09-01  
**Status:** Approved by User  

---

## 1. Overview & Objectives
1. **Dropdown Master Template Selector**: Convert the template chooser in `DocumentCreatorModal.tsx` into a clean dropdown selector with live scope preview.
2. **Audio Chimes Filter**: Restrict sound chimes and high-priority audio exclusively to verified digital signatures (`contract_signed`).
3. **Decimal Precision Fix**: Sanitize floating-point math in financial forms (`Math.round(total * 100) / 100`).
4. **Automated Invoicing & Renewal Lifecycle System**:
   - Monthly: 10-day notice draft creation, 5-day unpaid reminder alert.
   - Annual/Quarterly: 30-day notice draft creation, 7-day unpaid reminder alert.
   - Due date: Overdue service notice trigger.
5. **Dedicated Financial Hub (`/financials`)**:
   - Invoicing action queue (Drafts for Review, Sent/Pending, Overdue, Paid).
   - 1-Click Gmail invoice dispatch from `jeff@staxifytech.com`.
   - Official Staxify Invoice PDF engine with subtle watermark and `Remit to Staxify LLC`.
   - Renewal calendar & ARR/MRR metrics.

---

## 2. Architecture & Data Structures

### 2.1 Types (`src/types/crm.ts`)
```typescript
export type InvoiceStatus = 'draft' | 'sent' | 'reminder_sent' | 'overdue' | 'paid' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  orgId: string;
  invoiceNumber: string; // e.g. "INV-2026-001"
  customerId: string;
  customerName: string;
  issueDate: number;
  dueDate: number;
  status: InvoiceStatus;
  billingCycle: BillingCycle;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  remitTo: string;
  sentAt?: number;
  paidAt?: number;
  reminderSentAt?: number;
  createdAt: number;
  updatedAt: number;
}
```

### 2.2 Background Automation Schedule
- **Phase 1: Notice Draft Generation**:
  - Monthly: 10 days before due date ➔ Auto-generates Draft Invoice and notifies Admin: *"⚠️ Action Needed: Review Draft Invoice for [Customer]"*.
  - Annual/Quarterly: 30 days before due date ➔ Auto-generates Draft Invoice.
- **Phase 2: Unpaid Reminder**:
  - Monthly: 5 days before due date if status === 'sent' ➔ Admin alert & pre-fills reminder.
  - Annual/Quarterly: 7 days before due date if status === 'sent' ➔ Admin alert.
- **Phase 3: Due Date Expiration**:
  - On/after due date if unpaid ➔ Sets status to `overdue` (Notice of Service Interruption).
