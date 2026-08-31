# StaxHQ CRM Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a high-performance, multi-tenant ready B2B CRM, Document Hub, and Financial Management platform (StaxHQ) with digital e-signing, team @mention notes, calendar scheduling, and instant demo switching.

**Architecture:** Next.js 15 App Router with Tailwind CSS and Radix UI components, powered by Firebase Auth, Firestore partitioned by `orgId`, and Firebase Storage. Reusable e-sign canvas, PDF generation (`jspdf`), and AI assistant modules are cleanly structured with zero legacy restoration bloat.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Radix UI, Firebase 11, jsPDF, framer-motion, date-fns.

---

### Task 1: Project Scaffolding & Design Foundation
**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`
- Create: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/config/appConfig.ts` (Dynamic brand name, logo, company headers, default watermarks)
- Create: `src/lib/utils.ts` (Class merging, currency formatting, date formatting)

**Steps:**
1. Initialize package.json with dependencies (`next@15`, `react@19`, `firebase`, `lucide-react`, `jspdf`, `jspdf-autotable`, `clsx`, `tailwind-merge`, `date-fns`, `framer-motion`, `@radix-ui/*`).
2. Configure Tailwind with slate/indigo/emerald modern SaaS color palette and font system.
3. Configure `appConfig.ts` with brand name ("StaxHQ"), default headers, and demo presets.
4. Verify build and basic dev server initialization.

---

### Task 2: Firebase Connection & Multi-Tenant Org State Provider
**Files:**
- Create: `src/lib/firebase/config.ts`
- Create: `src/lib/firebase/authContext.tsx`
- Create: `src/lib/firebase/tenantContext.tsx` (Handles active `orgId`, default company `"stax"`, and instant Demo Org toggle)
- Create: `src/types/crm.ts` (Full TypeScript interfaces for Organizations, Customers, Contracts, Notes, CalendarEvents, Financials)

**Steps:**
1. Setup Firebase client configuration with environment fallback for local mock/demo mode.
2. Build `TenantContext` to supply current `orgId`, demo state, and switch between Primary & Demo organizations.
3. Define strict TypeScript models for Customers, Contracts, Financials, Notes, and Events.

---

### Task 3: App Shell, Modern Sidebar Navigation & Top Bar
**Files:**
- Create: `src/components/layout/AppSidebar.tsx`
- Create: `src/components/layout/TopHeader.tsx` (Demo mode switch banner, search bar, user menu, notification bell)
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/components/ui/*` (Button, Card, Badge, Dialog, DropdownMenu, Tabs, Input, Tooltip)

**Steps:**
1. Build collapsible responsive sidebar with routes: *Dashboard, Customers & Pipeline, Documents & Contracts, Calendar, Financials, Admin*.
2. Add live Demo Mode indicator banner and toggle in TopHeader.
3. Verify layout navigation and responsive design across desktop and tablet views.

---

### Task 4: Customers & Prospective Pipeline Hub
**Files:**
- Create: `src/app/(app)/customers/page.tsx` (Directory, tabs for Active Customers vs Prospects, search & filter)
- Create: `src/components/customers/CustomerList.tsx`
- Create: `src/components/customers/CustomerCard.tsx`
- Create: `src/components/customers/CustomerModal.tsx` (Add/Edit customer & contacts)
- Create: `src/app/(app)/customers/[id]/page.tsx` (Customer 360 Command Center)
- Create: `src/components/customers/CustomerOverviewTab.tsx`
- Create: `src/components/customers/CustomerFinancialsTab.tsx`
- Create: `src/components/customers/CustomerProjectsTab.tsx`

**Steps:**
1. Implement customer directory with status badges (*Active, Lead, Proposal Sent, Partner*).
2. Build Customer 360 page with quick stats (Total Value, Recurring ARR, Primary Contact) and tabbed views.
3. Connect Firestore customer CRUD operations scoped by `orgId`.

---

### Task 5: Document Hub, Digital E-Signing & Company Watermarking
**Files:**
- Create: `src/app/(app)/documents/page.tsx` (Document & Contract Repository)
- Create: `src/components/documents/DocumentUploader.tsx` (Drag-and-drop PDF upload)
- Create: `src/components/documents/DocumentPreviewModal.tsx`
- Create: `src/lib/pdf/pdfGenerator.ts` (Generates formatted PDFs with company header, logo, footer, and watermark stamp)
- Create: `src/components/documents/SignatureCanvasModal.tsx` (In-app drawing & typed signature pad)
- Create: `src/app/sign/[docId]/page.tsx` (Public-facing secure digital signature page)

**Steps:**
1. Build document upload and category tagging (Signed Contract, NDA, Proposal, SLA).
2. Implement header overlay and watermark engine (`"CONFIDENTIAL"`, `"DRAFT"`, `"SIGNED & EXECUTED"`).
3. Implement 1-click browser print layout and PDF export.
4. Implement `/sign/[docId]` interactive signature workflow with audit stamp (IP, timestamp, signer name/email).

---

### Task 6: Team Communication Hub (@Mentions & Notes Feed)
**Files:**
- Create: `src/components/notes/ActivityFeed.tsx`
- Create: `src/components/notes/NoteInput.tsx` (Rich input with `@` popup team member mentions)
- Create: `src/components/notes/NoteItem.tsx` (Categories: General, Call Log, Meeting, Urgent)
- Create: `src/components/notifications/NotificationBell.tsx` (Alerts for tagged mentions)

**Steps:**
1. Build interactive note composer with `@mention` dropdown searching team users.
2. Build realtime activity timeline linked to customer records.
3. Build in-app notification dropdown showing recent mentions and activity.

---

### Task 7: Integrated Calendar & Google Workspace Sync
**Files:**
- Create: `src/app/(app)/calendar/page.tsx`
- Create: `src/components/calendar/CalendarBoard.tsx` (Month, Week, Day schedule view)
- Create: `src/components/calendar/EventModal.tsx` (Create meeting, block time, link to client)
- Create: `src/lib/google/calendarSync.ts` (Google Workspace sync helper & iCal exporter)

**Steps:**
1. Build full interactive calendar grid with color-coded event types (*Meeting, Demo, Project Block, Milestone*).
2. Enable 1-click event creation directly linked to customer records (e.g. *Town of Rehobeth Council Meeting*).
3. Add Google Calendar connection settings and event export.

---

### Task 8: Financial Hub & Revenue Analytics
**Files:**
- Create: `src/app/(app)/financials/page.tsx`
- Create: `src/components/financials/RevenueMetrics.tsx` (MRR, ARR, Contract Totals, Overdue Alerts)
- Create: `src/components/financials/ContractValueChart.tsx`
- Create: `src/components/financials/BillingScheduleTable.tsx`

**Steps:**
1. Build executive financial KPI cards (Total Contract Value, Active Recurring MRR, Pipeline Value).
2. Build revenue breakdown tables by customer and billing cycle.
3. Add exportable financial report view.

---

### Task 9: AI Copilot & Query Assistant
**Files:**
- Create: `src/components/ai/AiChatDrawer.tsx`
- Create: `src/app/api/ai/query/route.ts` (Processes natural language queries over customer and financial records)

**Steps:**
1. Create floating AI Copilot toggle in bottom corner.
2. Connect prompt handler to answer questions (*"What is the total value of Town of Rehobeth's contract?"*, *"Show me all upcoming renewals"*).

---

### Task 10: Admin Console, Demo Mode Seeder & Final Polish
**Files:**
- Create: `src/app/(app)/admin/page.tsx` (Branding, Logo upload, Company Address, Default Watermarks, Team Management)
- Create: `src/lib/demo/demoSeeder.ts` (Instantly seeds realistic mock data: Town of Rehobeth, Metro Utility, Tri-County Healthcare, contracts, and notes)
- Create: `src/app/(app)/dashboard/page.tsx` (Executive Dashboard synthesizing CRM, Contracts, Calendar, and Revenue)

**Steps:**
1. Build Admin settings page for company header customization and watermark text.
2. Build Demo Seeder to populate the Demo Org with rich presentation-ready data.
3. Build main Executive Dashboard summarizing key CRM metrics, recent notes, and upcoming calendar meetings.
4. Run full TypeScript validation, build check, and smoke tests.
