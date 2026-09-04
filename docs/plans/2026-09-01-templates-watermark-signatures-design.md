# Design Doc: Document Template Vault, Subtle Brand Gradient Watermark & E-Signature Dispatch

**Date:** 2026-09-01  
**Status:** Approved by User  

---

## 1. Overview & Objectives
Transform StaxHQ's document and contracting system into an enterprise-grade document hub with:
1. **Subtle Bluish-Purple Brand Gradient Watermark**: Render the faint cyan-indigo-violet gradient on the Staxify isometric logo in PDF generation.
2. **Master Template Vault & Dynamic Contract Customizer**: Reusable template engine (GovStax MSA, Company Pulse MSA, SOW, NDA, Custom) with dynamic merge tags (`{{customer_name}}`, `{{setup_fee}}`, `{{recurring_amount}}`, etc.), editable scope text, and blank template creation.
3. **1-Click "Send via Gmail" Dispatch & Signature Placement**: Flexible signature block layout (Dual, Single, None) and 1-click Gmail/Mail compose with sender selection (`jeff@staxifytech.com`).

---

## 2. Architecture & Data Model

### 2.1 Types (`src/types/crm.ts`)
```typescript
export type SignaturePlacement = 'dual' | 'single_client' | 'none';

export interface ContractTemplate {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  category: 'agreement' | 'nda' | 'sow' | 'memo' | 'w9_summary' | 'custom';
  defaultWatermark: WatermarkOption;
  signaturePlacement: SignaturePlacement;
  scopeAndTermsText: string;
  additionalProvisions?: string;
  isDefault?: boolean;
  createdAt: number;
}
```

### 2.2 Seed Templates
- **GovStax Master Services Agreement (MSA)**: Municipal software deployment, SLA maintenance, annual billing provisions.
- **Company Pulse Master Services Agreement (MSA)**: Enterprise operational pulse platform, user seats, quarterly/annual billing.
- **Mutual Non-Disclosure Agreement (NDA)**: Proprietary information protection and intellectual property clauses.
- **Statement of Work (SOW)**: Detailed milestone deliverables, setup fee breakdown, and acceptance criteria.
- **Official Executive Memorandum**: General notices, policy addendums, and corporate announcements.

---

## 3. PDF Generator Engine (`src/lib/pdf/pdfGenerator.ts`)

### 3.1 Subtle Cyan-Indigo-Violet Gradient Watermark
- **Top Layer**: Cyan / Sky Blue (`doc.setDrawColor(56, 189, 248)`)
- **Middle Layer**: Indigo / Purple (`doc.setDrawColor(129, 140, 248)`)
- **Bottom Layer**: Violet / Magenta (`doc.setDrawColor(192, 132, 252)`)
- **Connector Struts**: Soft pastel lavender (`doc.setDrawColor(165, 180, 252)`)
- **Text**: Centered `STAXIFY` in soft slate-indigo with `LAYERED INTELLIGENCE` subtitle.

### 3.2 Dynamic Merge Tag Engine
Helper function `replaceMergeTags(text: string, customer?: Customer, customVals?: Record<string, string>)`:
- Replaces `{{customer_name}}`, `{{product_name}}`, `{{contact_name}}`, `{{contact_email}}`, `{{contact_phone}}`, `{{address}}`, `{{setup_fee}}`, `{{recurring_amount}}`, `{{billing_cycle}}`, `{{total_investment}}`, `{{date}}`.

### 3.3 Signature Placement Layouts
- **Dual Execution**: Left = Authorized Staxify Officer; Right = Authorized Client Signer.
- **Single Client Execution**: Right = Authorized Client Signer.
- **None**: Omits signature blocks entirely.

---

## 4. Document Hub & Creator UX

### 4.1 Document Creator Modal (`DocumentCreatorModal.tsx`)
- **Mode 1: "Generate Client Contract"**:
  - Pick Template (e.g. *GovStax MSA*).
  - Pick Customer (*Town of Rehobeth*).
  - Live editable textarea with pre-filled scope and populated merge tags.
  - Choose Watermark (`STAXIFY`, `CONFIDENTIAL`, etc.).
  - Choose Signature Placement.
  - Click **"Generate & Save to Client Hub"** or **"Generate & Send for Signature"**.
- **Mode 2: "Template Vault / Create Blank Template"**:
  - Start blank or edit existing template.
  - Insert placeholder tags with 1-click tag buttons (`+ Customer Name`, `+ Build Fee`, etc.).
  - Save as new Master Template (e.g. *GovStax MSA*).

### 4.2 Send for Signature Modal (`SendSignatureModal.tsx`)
- Sender email selector: `jeff@staxifytech.com`, `operations@staxifytech.com`, `support@staxifytech.com`.
- Recipient email pre-filled from customer contact.
- Secure signing URL: `http://localhost:3000/sign/[docId]`.
- Buttons:
  - **"✉️ Send with Gmail (jeff@staxifytech.com)"**: Opens Gmail compose tab.
  - **"✉️ Open in Default Mail App"**: Opens mailto.
  - **"📋 Copy Direct Link"**: Copies URL to clipboard.
