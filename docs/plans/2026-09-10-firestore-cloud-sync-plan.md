# Real-Time Firestore Cloud Sync & Data Migration Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Connect StaxHQ CRM data (customers, contracts, invoices, projects, transactions, notes, events, team members, passwords) directly to real-time Google Cloud Firestore (`staxhq-74672`), with automated migration of existing local browser data.

**Architecture:** Implement a modular Firestore synchronization engine in `src/lib/firebase/firestoreService.ts` and wire real-time listeners into `TenantContext`. Add multi-browser live sync, local storage fallback, and a cloud sync status indicator in the UI.

**Tech Stack:** Next.js 15, React 19, Firebase v11 (`firebase/firestore`), Tailwind CSS, Lucide Icons.

---

### Task 1: Create Firestore Real-Time Cloud Service
**Files:**
- Create: `src/lib/firebase/firestoreService.ts`

**Steps:**
1. Implement helper functions for Firestore collections:
   - `subscribeToCollection<T>(orgId: string, collectionName: string, onUpdate: (items: T[]) => void): () => void`
   - `syncDocument<T extends { id?: string; uid?: string }>(orgId: string, collectionName: string, docId: string, data: T): Promise<void>`
   - `removeDocument(orgId: string, collectionName: string, docId: string): Promise<void>`
   - `batchUploadCollection<T extends { id?: string; uid?: string }>(orgId: string, collectionName: string, items: T[]): Promise<number>`
   - `syncAuthCredentials(orgId: string, passwords: Record<string, string>): Promise<void>`
   - `subscribeToAuthCredentials(orgId: string, onUpdate: (passwords: Record<string, string>) => void): () => void`

---

### Task 2: Integrate Cloud Sync & Auto-Migration into TenantContext
**Files:**
- Modify: `src/lib/firebase/tenantContext.tsx`

**Steps:**
1. Connect `useEffect` listeners for `customers`, `contracts`, `invoices`, `projects`, `bankTransactions`, `notes`, `events`, `teamMembers`, and `userPasswords`.
2. Add automatic local data migration: if Firestore collection count is 0 and local storage contains data, auto-upload to Firestore.
3. Update all mutation functions (`addCustomer`, `updateCustomer`, `deleteCustomer`, `addInvoice`, `addContract`, etc.) to write directly to Firestore using `syncDocument` and `removeDocument`.
4. Expose `cloudSyncStatus: "synced" | "syncing" | "offline" | "error"` and `manualSyncToCloud: () => Promise<void>` in `TenantContextType`.

---

### Task 3: Cloud Sync Status Indicator & Manual Migration Tool in UI
**Files:**
- Modify: `src/components/layout/Header.tsx` or `src/components/layout/Navbar.tsx` (add cloud sync badge: `🟢 Cloud Synced`)
- Modify: `src/app/(app)/admin/page.tsx` (add "Cloud Database & Storage Migration" card with 1-click "Push Local Data to Cloud" and "Pull Cloud Data")

---

### Task 4: Production Build Verification & Rollout
**Files:**
- Run: `npm run build`
- Run: `npx tsc --noEmit`
- Commit and push to deploy to production.
