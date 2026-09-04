# Team Notifications, Alerts & Push Notification Engine Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Duplicate and adapt the notification and alert system from Company Pulse into StaxHQ, featuring a zero-dependency Web Audio bell chime, native browser push notification banners, dedicated `AppNotification` state management, automatic triggers for @mentions and contract signatures, and a slide-over Notifications Drawer.

**Architecture:** 
- Synthesized Web Audio API bell chime for instant acoustic alerts.
- Native HTML5 Notification API for desktop/mobile push banners.
- Dedicated `AppNotification` collection in `tenantContext` with auto-dispatch triggers.
- Modern slide-over drawer UI with quick actions (Mark as Read, Clear, Deep Link).

**Tech Stack:** Next.js 15, TypeScript, Web Audio API, HTML5 Notification API, Tailwind CSS, Lucide React, React Context.

---

### Task 1: Add Notification Types & Data Structures
**Files:**
- Modify: `src/types/crm.ts`

**Details:**
- Define `NotificationType = 'mention' | 'contract_signed' | 'contract_pending' | 'urgent_alert' | 'customer_milestone' | 'system'`
- Define `AppNotification` interface with recipient, sender, type, title, messageSnippet, targetUrl, customer/doc references, read status, and timestamps.

---

### Task 2: Web Audio Bell Chime Synthesizer
**Files:**
- Create: `src/lib/notifications/notificationSound.ts`

**Details:**
- Implement `playNotificationChime()` using `window.AudioContext` (E5 @ 659.25Hz -> B5 @ 987.77Hz with exponential gain decay). Zero dependencies, works offline.

---

### Task 3: Native Browser Push Notification Service
**Files:**
- Create: `src/lib/notifications/notificationService.ts`

**Details:**
- Implement `requestPushPermission()`, `hasPushPermission()`, and `triggerBrowserPushBanner(title, body, tag, onClickUrl)`.
- Handles automatic banner display when tab is in background or foreground.

---

### Task 4: Notification State & Auto-Dispatch Triggers in TenantContext
**Files:**
- Modify: `src/lib/firebase/tenantContext.tsx`
- Modify: `src/lib/demo/seedData.ts`

**Details:**
- Add `notifications: AppNotification[]` to Tenant Context.
- Add helper methods: `sendNotification`, `markNotificationRead`, `markAllNotificationsRead`, `deleteNotification`, `clearAllNotifications`.
- Add auto-dispatch triggers:
  - When notes with `@mentions` or `category === 'urgent'` are saved -> generate notification and trigger chime.
  - When a contract is signed -> generate "✓ Verified Signature on [Contract Title]" notification with chime & push banner.
- Seed realistic demo notifications in `seedData.ts`.

---

### Task 5: Slide-Over Notifications Drawer Component
**Files:**
- Create: `src/components/notifications/NotificationsDrawer.tsx`
- Modify: `src/components/notifications/NotificationBell.tsx`

**Details:**
- Build full slide-over drawer with:
  - Unread count badge and pulsing indicator.
  - One-click "Enable Desktop Push Notifications" toggle banner.
  - Notification cards with category icons, time ago, sender name, message snippet.
  - "Mark All as Read" & "Clear All" actions.
  - Direct deep-links to `/customers/[id]` and `/documents`.
  - "Test Alert & Audio Chime" button for quick verification.

---

### Task 6: Top Header Integration
**Files:**
- Modify: `src/components/layout/TopHeader.tsx`

**Details:**
- Replace basic bell dropdown with `NotificationsDrawer` component.

---

### Task 7: Verification & Build Validation
- Run `npm run build` to verify 0 TypeScript errors and clean compilation.
