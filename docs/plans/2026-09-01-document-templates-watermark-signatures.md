# Document Templates, Subtle Watermark & E-Signature Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a complete Document Template Vault with dynamic merge tags (`{{customer_name}}`, `{{setup_fee}}`, `{{recurring_amount}}`), editable contract scope/clauses, faint cyan-indigo-violet gradient Staxify watermark, and 1-click "Send via Gmail from `jeff@staxifytech.com`" e-signature dispatch.

**Architecture:** Extend `pdfGenerator.ts` with multi-tone pastel gradient drawing and merge tag interpolation. Add `ContractTemplate` state in `tenantContext.tsx` with pre-seeded GovStax MSA, Company Pulse MSA, SOW, and NDA templates. Update `DocumentCreatorModal.tsx` to support both client document generation and template authoring. Build `SendSignatureModal.tsx` for 1-click Gmail and mailto dispatch.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, jsPDF, Web Audio API, Lucide Icons.

---

### Task 1: Data Types & Merge Tag Helper Utility
**Files:**
- Modify: `src/types/crm.ts`
- Modify: `src/lib/utils.ts`

**Details:**
- Define `ContractTemplate` interface and `SignaturePlacement` type (`'dual' | 'single_client' | 'none'`).
- Add `replaceMergeTags(templateText, customer, customValues)` in `src/lib/utils.ts` to substitute `{{customer_name}}`, `{{product_name}}`, `{{setup_fee}}`, `{{recurring_amount}}`, `{{billing_cycle}}`, `{{total_investment}}`, `{{contact_name}}`, `{{contact_email}}`, `{{date}}`.

---

### Task 2: Subtle Cyan-Indigo-Violet Gradient Staxify Watermark in PDF Engine
**Files:**
- Modify: `src/lib/pdf/pdfGenerator.ts`

**Details:**
- In `applyLetterheadAndWatermark`, when `watermark === "STAXIFY"`, draw the 3 isometric mesh levels using soft brand pastel colors:
  - Level 1 (Top diamond): Cyan (`#38BDF8` / RGB `56, 189, 248`)
  - Level 2 (Middle diamond): Indigo (`#818CF8` / RGB `129, 140, 248`)
  - Level 3 (Bottom diamond): Violet (`#C084FC` / RGB `192, 132, 252`)
  - Vertical connection struts: Soft lavender (`#A5B4FC` / RGB `165, 180, 252`)
  - Centered `STAXIFY` in stylized soft slate-indigo (`#818CF8` / `#64748B`)
- Support rendering dynamic custom scope text and flexible signature blocks (Dual, Single, None).

---

### Task 3: Template Vault Store & Seed Templates in TenantContext
**Files:**
- Modify: `src/lib/firebase/tenantContext.tsx`
- Modify: `src/lib/demo/seedData.ts`

**Details:**
- Add `templates`, `addTemplate`, `updateTemplate`, and `deleteTemplate` to `TenantContext`.
- Seed standard Master Templates:
  - **GovStax Master Services Agreement (MSA)**
  - **Company Pulse Master Services Agreement (MSA)**
  - **Mutual Non-Disclosure Agreement (NDA)**
  - **Statement of Work (SOW)**
  - **Executive Memorandum**

---

### Task 4: Upgraded Document Creator Modal with Template Vault & Live Scope Editor
**Files:**
- Modify: `src/components/documents/DocumentCreatorModal.tsx`

**Details:**
- **Tab 1: "Generate Client Contract"**:
  - Pick Template (e.g. *GovStax MSA* or *Company Pulse MSA*).
  - Pick Customer (*Town of Rehobeth*).
  - Pre-fills all merge tags and displays editable Scope of Work & Terms textarea.
  - Choose Watermark (`STAXIFY`, `CONFIDENTIAL`, etc.) & Signature Placement.
  - Buttons: **"Generate & Save to Hub"** and **"Generate & Send for Signature"**.
- **Tab 2: "Template Vault / Create Blank Template"**:
  - Author a custom template with 1-click merge tag insert buttons (`+ Customer Name`, `+ Build Fee`, etc.).
  - Choose default watermark and signature placement.
  - Button: **"Save as Master Template"**.

---

### Task 5: 1-Click "Send for Signature via Gmail" Modal
**Files:**
- Create: `src/components/documents/SendSignatureModal.tsx`
- Modify: `src/app/(app)/documents/page.tsx`
- Modify: `src/components/documents/DocumentPreviewModal.tsx`

**Details:**
- Sender dropdown: `jeff@staxifytech.com`, `operations@staxifytech.com`, `support@staxifytech.com`.
- Recipient email: Pre-filled from customer primary contact.
- 1-Click **"✉️ Send with Gmail (jeff@staxifytech.com)"** (opens pre-filled Gmail compose window).
- 1-Click **"✉️ Open in Default Mail App"** (opens mailto).
- 1-Click **"📋 Copy Direct Signing Link"**.
- Sets document status to `sent_for_signature` and triggers team notification chime.

---

### Task 6: Verification & Build Validation
- Run `npm run build` to verify compilation and static page generation.
