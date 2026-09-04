# Document Hub & Lightweight Document Creator Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Transform the Documents section into a centralized Company Document Hub & Vault (for W-9, LLC docs, insurance COI, blank standard agreements) and built-in Lightweight Document Creator for instant branded letterhead contracts, memos, and NDAs.

**Architecture:** Dual-mode document architecture supporting both static uploaded files (PDFs, Word docs, tax forms) and dynamically generated letterhead PDFs from built-in templates (MSA, Mutual NDA, Statement of Work, Official Letterhead Memo, W-9 Tax Summary).

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React, jsPDF, jspdf-autotable, React Context.

---

### Task 1: Update Types & Data Structures
**Files:**
- Modify: `src/types/crm.ts`

**Details:**
- Add `DocumentScope = 'company_vault' | 'client_contract' | 'template'`
- Expand `DocumentType` / `DocumentCategory` to include `'tax_w9' | 'llc_legal' | 'insurance' | 'memo' | 'agreement' | 'sla' | 'proposal' | 'nda' | 'invoice' | 'custom'`
- Make `customerId` optional on `ContractDocument` to support global company vault documents.
- Add `scope`, `templateType`, and `templateData` fields.

---

### Task 2: Enhance Seed Data with Company Vault & Template Assets
**Files:**
- Modify: `src/lib/demo/seedData.ts`

**Details:**
- Add realistic company vault records:
  - `Form W-9 (Request for Taxpayer Identification Number & Certification)`
  - `LLC Certificate of Formation & Articles of Organization`
  - `Commercial General Liability Certificate of Insurance (COI)`
  - `Standard Master Services Agreement (Blank Template - 2026)`
  - `Standard Mutual Non-Disclosure Agreement (Template)`
- Ensure existing client contracts for Town of Rehobeth and Tri-County Medical are tagged with appropriate scope.

---

### Task 3: Expand PDF Generation Engine with Multi-Template Support & Printing
**Files:**
- Modify: `src/lib/pdf/pdfGenerator.ts`

**Details:**
- Implement dedicated template renderers:
  - `generateContractPdf` (enhanced with scope, products, fees)
  - `generateLetterheadMemoPdf` (Official executive memo / notice)
  - `generateNdaPdf` (Standard Mutual NDA)
  - `generateSowPdf` (Statement of Work with deliverables table)
  - `generateW9SummaryPdf` (Company Tax ID & Legal Entity sheet)
- Provide uniform helper functions: `generatePdfBlobUrl`, `downloadDocumentPdf`, `printDocumentPdf`.

---

### Task 4: In-Browser Document Preview & Print Modal
**Files:**
- Create: `src/components/documents/DocumentPreviewModal.tsx`

**Details:**
- In-browser modal to preview any document (either generated PDF via iframe blob or uploaded file info).
- Includes one-click Print button (`window.print` / PDF autoprint), Download button, Watermark indicator, and metadata sidebar.

---

### Task 5: Lightweight Document Creator & Letterhead Generator Modal
**Files:**
- Create: `src/components/documents/DocumentCreatorModal.tsx`

**Details:**
- Multi-step / interactive creator modal:
  1. Select Template (Standard MSA, Mutual NDA, Statement of Work, Letterhead Memo, W-9 Tax Summary).
  2. Fill in details (Title, Recipient / Customer link, custom scope/body text, pricing, effective date).
  3. Customize Letterhead & Watermark (`CONFIDENTIAL`, `DRAFT`, `ORIGINAL`, `SIGNED & EXECUTED`, or None).
  4. 1-Click "Save & Add to Hub" with instant Preview / Download / Print.

---

### Task 6: Upgrade Document Uploader Modal for Universal Uploads
**Files:**
- Modify: `src/components/documents/DocumentUploaderModal.tsx`

**Details:**
- Support choosing Scope: `Company & Tax Vault (Global)` vs `Client Contract (Customer-Specific)` vs `Standard Template`.
- Expanded document categories (W-9, LLC Papers, Insurance COI, MSA, SLA, Proposal, NDA, etc.).
- Drag & drop PDF/Word file uploader.

---

### Task 7: Redesign Documents Page into Full Document Hub
**Files:**
- Modify: `src/app/(app)/documents/page.tsx`

**Details:**
- Scope Tabs: `All Files`, `Company & Tax Vault` (W-9, LLC, Insurance), `Client Contracts`, `Standard Templates`.
- KPI summary cards for Company Assets, Active Client Agreements, Signed Records, Pending Signatures.
- Comprehensive search bar & category dropdown filter.
- Document Cards/List with rich metadata (Scope badge, category icon, customer link, watermark pill, signer status).
- Direct action buttons on each document: 👁️ Preview, 🖨️ Print, 📥 Download, ✍️ Sign Digitally, 🔗 Share Link, 🗑️ Delete.
- Two primary action buttons in header: `+ Create Document` (opens generator) and `Upload File` (opens vault uploader).

---

### Task 8: Verification & Build Validation
- Run `npm run build` or Next.js build verification to guarantee 0 TypeScript errors and seamless production compilation.
