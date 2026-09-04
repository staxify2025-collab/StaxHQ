# Implementation Plan: Calendar Upgrades, Direct Google Sync, Staxify Letterhead & Brand Watermark

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement the 6 specific enhancements requested by the user:
1. **Calendar Event Editing & Employee Tagging**: Click any calendar event to open edit mode; multi-select assigned employees with shared visibility and tag notifications.
2. **Direct Google Calendar Action**: 1-click "Add to Google Calendar" button generating a pre-filled Google Calendar URL with date, 1-hour block, notes, and tagged guests, plus `.ics` export.
3. **1-Hour Auto-Advancing Time Picker**: 15-minute increments (`:00`, `:15`, `:30`, `:45`), centered AM/PM toggle, and automatic 1-hour end-time calculation (e.g., selecting `01:00 PM` automatically sets end time to `02:00 PM`).
4. **Automated Event Reminders**: Options for 15m, 30m, 1h, 2h before the meeting that automatically trigger Web Audio bell chimes, desktop push banners, and team notifications.
5. **Brand Letterhead Typography**: Update PDF letterhead branding from all-caps `STAXIFY` to `Staxify` (with capitalized S) and `LAYERED INTELLIGENCE` subtitle.
6. **Watermark Standard & Staxify Isometric Brand Watermark**: Restrict watermark choices to `No Watermark`, `CONFIDENTIAL`, `DRAFT`, `FOR REVIEW ONLY`, `INTERNAL USE ONLY`, and `STAXIFY`. When `STAXIFY` is selected, render the faint isometric layered mesh brand watermark centered across the PDF.

---

### Task 1: Type Definitions & Google Calendar Helper Utilities
**Files:**
- Modify: `src/types/crm.ts`
- Modify: `src/lib/utils.ts`

**Details:**
- Add `reminderMinutes?: number` and `reminded?: boolean` to `CalendarEvent`.
- Define standardized `WatermarkOption` union type (`"NONE" | "CONFIDENTIAL" | "DRAFT" | "FOR REVIEW ONLY" | "INTERNAL USE ONLY" | "STAXIFY"`).
- Implement `generateGoogleCalendarUrl(event, attendees, customer)` and `downloadIcsFile(event)`.

---

### Task 2: Upgraded EventModal with 15-Min 1-Hour Time Picker, Employee Tagging & Direct Google Sync
**Files:**
- Modify: `src/components/calendar/EventModal.tsx`

**Details:**
- Support both Create & Edit modes (`initialData?: CalendarEvent`).
- Custom Time Picker: 15-minute intervals (`:00`, `:15`, `:30`, `:45`), centered `[ AM | PM ]` toggle, and auto-updating End Time (+1 hour).
- Multi-Employee Tagging: Checkboxes / pills for team members (`Admin Operator`, `Sarah Jenkins`, `Marcus Vance`, etc.).
- Reminder Selector: `None`, `15 mins`, `30 mins`, `1 hour`, `2 hours`, `1 day`.
- Quick Actions: **"📅 Add to Google Calendar"** (1-click direct link), **"📥 Export .ics"**, and **"Delete Event"**.

---

### Task 3: Calendar Schedule Board Interactive Clicks & Attendee Badges
**Files:**
- Modify: `src/app/(app)/calendar/page.tsx`
- Modify: `src/lib/firebase/tenantContext.tsx`

**Details:**
- Connect click handlers on all month grid day events, sidebar event cards, and agenda list items to open `EventModal` in edit mode.
- In `tenantContext.tsx`, implement `updateEvent` and automated reminder background checker to fire chimes/push alerts.

---

### Task 4: Staxify Capitalized Letterhead & Isometric Layered Brand Watermark in PDF Engine
**Files:**
- Modify: `src/lib/pdf/pdfGenerator.ts`
- Modify: `src/components/documents/DocumentCreatorModal.tsx`
- Modify: `src/components/documents/DocumentUploaderModal.tsx`

**Details:**
- In `pdfGenerator.ts`:
  - Update letterhead header to render `Staxify` (with capitalized S) instead of all-caps `STAXIFY`.
  - Update watermark rendering:
    - Standard text watermarks: `CONFIDENTIAL`, `DRAFT`, `FOR REVIEW ONLY`, `INTERNAL USE ONLY`.
    - `STAXIFY` brand watermark: Render centered translucent isometric layered wireframe geometry + `Staxify` / `LAYERED INTELLIGENCE` matching the user's screenshot.
- In `DocumentCreatorModal.tsx` & `DocumentUploaderModal.tsx`:
  - Update watermark dropdown to the exact 6 options.

---

### Task 5: Admin Integrations Placeholder for Future 2-Way Sync
**Files:**
- Modify: `src/app/(app)/admin/page.tsx`

**Details:**
- Add a Google Workspace Calendar integration card with connection status and iCal feed URL settings.

---

### Task 6: Verification & Build Validation
- Run `npm run build` to verify type safety and compilation.
