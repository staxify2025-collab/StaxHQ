# Document Hub & Lightweight Document Creation Center Design

## 1. Overview & Vision
Transform the existing "Documents & Contracts" page into a comprehensive **Document Hub & Resource Center** with dual functionality:
1. **Universal Document Hub & Vault**: Upload, store, categorize, search, preview, and print company master files (LLC articles, Form W-9, Insurance COI, Blank standard agreements) alongside client-specific contracts and executed SLAs.
2. **Lightweight In-App Document Creator**: A 30-second generator for standard agreements, NDAs, SOWs, and official letterhead memos with automated company letterhead branding, dynamic watermarking, customer data pre-filling, and 1-click printing/downloading.

---

## 2. Architecture & Categorization

### Document Scopes & Categories
* **Company & Tax Vault (`company_vault`)**:
  * `tax_w9`: Form W-9, EIN Verification, Tax Exemption certificates.
  * `llc_legal`: LLC Formation, Operating Agreement, State Filings.
  * `insurance`: Certificates of Insurance (COI), Liability policies.
  * `standard_templates`: Blank Master Agreement, Blank Mutual NDA, Standard Rate Card.
* **Client Agreements (`client_contract`)**:
  * `agreement`: Master Services Agreements (MSAs).
  * `sla`: Service Level Agreements & Support Schedules.
  * `proposal`: Statements of Work (SOW) & Estimates.
  * `nda`: Mutual or One-Way Non-Disclosure Agreements.
  * `memo`: Formal Letterhead Notices & Project Addenda.
  * `invoice`: Financial billing schedules.

---

## 3. Core Capabilities & UI Components

### A. Document Hub Header & Vault Filter Bar
* **Scope Tabs**:
  * `All Files` (Comprehensive view)
  * `Company & Tax Vault` (W-9, LLC, Insurance, Standard Templates)
  * `Client Contracts` (Customer-linked executed files & drafts)
  * `Standard Templates` (Reusable blank templates)
* **Status Pills**: `All`, `Official Record`, `Signed & Executed`, `Pending Signature`, `Draft`.
* **Search & Filters**: Instant full-text search across document title, customer name, file name, and category tags.

### B. Document List & Grid Views
* **Quick Actions on every card/row**:
  * 👁️ **Preview**: In-browser document modal with zoom, print, and download.
  * 🖨️ **1-Click Print**: Generates high-res printable PDF with company header.
  * 📥 **Download PDF**: Instant local download.
  * ✍️ **Sign Digitally**: Digital signature canvas with audit log.
  * 🔗 **Share Public Link**: Copies public e-signature or view link.
  * 🗑️ **Delete / Archive**.

### C. Lightweight Document Creator & Letterhead Generator Modal
* **Pre-built Document Types**:
  1. **Standard Master Services Agreement (MSA)**: Product tier, setup build fee, monthly recurring retainer, billing cycle, term length, signature blocks.
  2. **Standard Mutual NDA**: Confidentiality terms, non-disclosure scope, signature lines.
  3. **Official Letterhead Memo / Notice**: Branded header, date, recipient, subject, custom multi-paragraph text, sign-off.
  4. **Statement of Work (SOW)**: Project scope, milestones, deliverable breakdown, payment schedule.
  5. **Company W-9 & Tax Info Summary**: Entity legal name, DBA, EIN/Tax ID, address, tax classification, authorized representative signature.
* **Letterhead & Watermark Options**:
  * Customizable diagonal watermarks (`CONFIDENTIAL`, `DRAFT`, `SIGNED & EXECUTED`, `ORIGINAL`, `INTERNAL USE ONLY`, `FOR REVIEW ONLY`, or Custom).
  * Automatic company letterhead branding (Staxify / StaxHQ logo, address, phone, email, web, Indigo divider line).

### D. Universal Document Uploader Modal
* Drag-and-drop file uploader (PDF, DOCX, PNG, JPG).
* Category assignment (`Company Vault` vs `Client Contract`).
* Optional customer association (or Mark as Company Master File).
* Watermark stamping preference.

---

## 4. Data Model Enhancements
```typescript
export type DocumentScope = 'company_vault' | 'client_contract' | 'template';
export type DocumentCategory = 
  | 'agreement' 
  | 'sla' 
  | 'proposal' 
  | 'nda' 
  | 'tax_w9' 
  | 'llc_legal' 
  | 'insurance' 
  | 'memo' 
  | 'invoice' 
  | 'custom';

export interface ContractDocument {
  id: string;
  orgId: string;
  scope: DocumentScope;
  customerId?: string; // Optional for company vault docs
  customerName?: string;
  title: string;
  type: DocumentCategory;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  contentHtml?: string;
  templateType?: string;
  templateData?: Record<string, any>;
  watermarkText?: string;
  signatureRequired: boolean;
  signatureData?: {
    signerName: string;
    signerEmail: string;
    signatureImageBase64?: string;
    signedAt: number;
    ipAddress?: string;
    auditLogId: string;
  };
  createdAt: number;
  updatedAt: number;
}
```

---

## 5. PDF Generation & Printing Engine
* `src/lib/pdf/pdfGenerator.ts` will support:
  * Official Letterhead & Watermark rendering for all generated templates.
  * Specialized template layout generators:
    * `generateLetterheadMemoPdf`
    * `generateStandardMsaPdf`
    * `generateNdaPdf`
    * `generateSowPdf`
    * `generateW9SummaryPdf`
  * Blob URL generation for in-browser modal preview and instant printing.
