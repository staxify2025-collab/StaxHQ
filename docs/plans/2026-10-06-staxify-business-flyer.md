# Staxify Business Cardstock Flyer Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Create a high-impact, printable 8.5" × 11" US Letter cardstock business flyer / sell-sheet for Staxify featuring the company letterhead, core service pillars, comparison matrix, local Alabama engineering focus, and direct founder contact footer, accessible via a new "Flyer" button in the Top Header.

**Architecture:** A dedicated Next.js App Router page at `/flyer` with responsive screen preview controls (1-click print, inline live text editor, preset switcher) and strict `@page` / `@media print` CSS styling for pixel-perfect cardstock output. A direct link button is added to `TopHeader.tsx` beside the Cloud Synced status badge.

**Tech Stack:** Next.js 15 App Router, React 19, Lucide React icons, Tailwind CSS, Vanilla CSS print media queries.

---

### Task 1: Add "Flyer" Action Button to TopHeader
**Files:**
- Modify: `src/components/layout/TopHeader.tsx`

**Step 1:** Add the `Printer` icon and a stylish Link button titled **Flyer** directly beside the `Cloud Synced` status badge.
**Step 2:** Ensure the button matches existing design tokens, provides a tooltip, and navigates cleanly to `/flyer`.
**Step 3:** Run `npx tsc --noEmit` to verify type safety.

---

### Task 2: Create the Staxify Business Flyer Page (`/flyer`)
**Files:**
- Create: `src/app/(app)/flyer/page.tsx`

**Step 1: Build Screen Controls Toolbar (Screen-Only / Hidden on Print)**
- Back button to Dashboard (`/dashboard`).
- Preset switcher dropdown (`Universal Business Flyer`, `Local Alabama Focus`, `Civic & Municipal Focus`).
- Live inline editor toggle button (`Edit Flyer Text` / `Done Editing`) with contentEditable support.
- Reset to Default button.
- 1-Click "Print Flyer / PDF" button (`window.print()`).
- Cardstock badge indicator (`8.5" × 11" US Letter Cardstock`).

**Step 2: Build Cardstock Canvas (`.print-canvas`) with Letterhead & Content Flow**
- **Top Letterhead Header:**
  - Left: Staxify Dark Rounded Logo (`/stax-logo.png`) + `Staxify` Title + `LAYERED INTELLIGENCE` subtitle.
  - Right: `🌟 CENTRAL ALABAMA TECH TEAM` / `Direct Senior Engineers • Zero Offshore Friction` badge.
- **Hero Value Proposition Banner:**
  - Tag: `⚡ BESPOKE CUSTOM SOFTWARE & AI PIPELINES`
  - Headline: `Modernize Your Operations With High-Velocity Custom Software & AI.`
  - Subtext: `We build intelligent customer apps, automated AI data pipelines, and civic enterprise platforms that eliminate manual friction, modernize legacy workflows, and scale your business.`
- **3 Core Value Pillars (3-Column Grid):**
  - Pillar 1: `🚀 Custom Web & Mobile Apps` (Bespoke portals, PWAs, client dashboards, rapid MVP turnaround).
  - Pillar 2: `🧠 AI Data Migration & Pipelines` (Legacy DB modernization, automated data extraction, real-time cloud sync).
  - Pillar 3: `🏛️ GovStax Municipal Suite` (ADA Title II certified town portals, 24/7 online bill pay, 3-1-1 work orders).
- **4 Key Capabilities Matrix (2x2 Grid):**
  - `Custom Enterprise Builds` • `Automated AI Data Migration` • `Automated Invoicing & Financial Hubs` • `Local Face-to-Face Alabama Support`.
- **"The Staxify Advantage" Comparison Table:**
  - Fast Delivery (Weeks vs. Months) • 100% Local Founders vs. Offshore Outsourcing • Modern Real-Time Cloud vs. Legacy Bloat • Transparent Retainers.
- **Executive Footer Contact Banner:**
  - Tag: `🤝 FREE DISCOVERY SESSION`
  - Headline: `Ready to Build or Modernize? Let's Talk.`
  - Contact 1: `Jeff Norris — Co-Founder` (`jeff@staxifytech.com`)
  - Contact 2: `Josh Jackson — Co-Founder` (`jjackson@staxifytech.com`)
  - Web: `staxifytech.com` • Location: `Central Alabama / Birmingham Metro`

**Step 3: Inject Exact Cardstock Print CSS**
- `@page { size: letter portrait; margin: 0 !important; }`
- `@media print { html, body { height: 100% !important; overflow: hidden !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`
- Box-sizing, zero-overflow margins, `page-break-inside: avoid`.

---

### Task 3: Local Dev Verification & Type Checks
**Files:**
- Test: Run TypeScript compilation (`npx tsc --noEmit`)
- Test: Run Next.js production build (`npm run build`)
- Test in browser dev server (`npm run dev`)
- **Important Constraint:** Do NOT push to GitHub remote (`origin main`) until the user verifies in local dev.
