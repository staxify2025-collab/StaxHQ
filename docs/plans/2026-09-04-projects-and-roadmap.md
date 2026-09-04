# Projects & Roadmap Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a native, interactive "Projects & Roadmap" Kanban pipeline in Staxify with 5 columns (Theory, Not Started, In Progress, Needs Attention, Complete), rich cards (assignees, notes, priorities, checklists), direct Customer linking, and 1-click Notion migration/seeding.

**Architecture:** Extend CRM types with `ProjectCard`, wire state into `tenantContext.tsx` with localStorage persistence across both primary & demo modes, add navigation in `AppSidebar.tsx`, and construct a full suite of responsive Kanban & Table views with modals for creating, editing, and logging notes.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI dialogs/dropdowns, Lucide React icons, Framer Motion animations.

---

### Task 1: Type Definitions & Seed Data
**Files:**
- Modify: `src/types/crm.ts`
- Modify: `src/lib/demo/seedData.ts`

**Step 1: Add Project Card Types**
Define `ProjectStage` (`'theory' | 'not_started' | 'in_progress' | 'needs_attention' | 'completed'`), `ProjectPriority` (`'low' | 'medium' | 'high' | 'urgent'`), `ProjectTaskItem`, `ProjectNoteItem`, and `ProjectCard` in `src/types/crm.ts`.

**Step 2: Add Notion Seed Data**
Add `initialProjects` and `demoProjects` in `src/lib/demo/seedData.ts` containing the actual projects from the Notion board (`GovStax`, `SPANLINK`, `RESTORE PRO`, `COMMUNITY CONNECT`, `SENIOR CARE "TELS" PROJECT`, etc.).

**Step 3: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 2: State Management & CRUD in Tenant Context
**Files:**
- Modify: `src/lib/firebase/tenantContext.tsx`

**Step 1: Add Projects Store and Methods**
Add state variables:
- `primaryProjects`, `demoProjectsState`
- `projects: ProjectCard[]`
- `addProject(data: Omit<ProjectCard, "id" | "orgId" | "createdAt" | "updatedAt">)`
- `updateProject(id: string, updates: Partial<ProjectCard>)`
- `deleteProject(id: string)`
- `moveProjectStage(id: string, newStage: ProjectStage)`
- `addProjectNote(projectId: string, content: string, authorName: string)`
- `toggleProjectTask(projectId: string, taskId: string)`
- `importProjects(projects: ProjectCard[])`

**Step 2: Hook up LocalStorage Persistence**
Save and load `staxhq_primary_projects` and `staxhq_demo_projects`.

**Step 3: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 3: Sidebar Navigation Integration
**Files:**
- Modify: `src/components/layout/AppSidebar.tsx`

**Step 1: Add "Projects & Roadmap" to Navigation**
Add navigation item:
```typescript
{
  name: "Projects & Roadmap",
  href: "/projects",
  icon: FolderKanban,
}
```
Position it right after `Customers & Pipeline` and display the dynamic project count badge.

**Step 2: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 4: Interactive Kanban Board & Card Components
**Files:**
- Create: `src/components/projects/ProjectKanbanBoard.tsx`
- Create: `src/components/projects/ProjectCardItem.tsx`
- Create: `src/components/projects/ProjectTableView.tsx`

**Step 1: Build Column & Card Views**
- 5 stylized pipeline columns with count badges and stage headers.
- HTML5 Drag-and-Drop + quick move action buttons.
- Cards displaying priority color tags, assignee avatars, linked customer badges, checklist progress bar, notes count badge.

**Step 2: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 5: Project Modals (Creator, Detail/Editor, Notion Importer)
**Files:**
- Create: `src/components/projects/ProjectCreatorModal.tsx`
- Create: `src/components/projects/ProjectDetailModal.tsx`
- Create: `src/components/projects/NotionImportModal.tsx`

**Step 1: Build Project Creator Modal**
Modal for rapid card creation with stage, priority, assignees, linked customer, tags, and description.

**Step 2: Build Project Detail & Editor Modal**
Comprehensive modal with:
- Editable properties (title, stage, priority, due date, customer link)
- Interactive task checklist manager (add, check/uncheck, remove)
- Activity & Notes log tab (add timestamped notes, view history)

**Step 3: Build Notion Importer Modal**
Modal with "1-Click Seed from Notion Snapshot" and JSON import/export tools.

**Step 4: Verification**
Run: `npm run typecheck`
Expected: PASS

---

### Task 6: Main Route Page (`/projects`) & Executive Dashboard Integration
**Files:**
- Create: `src/app/(app)/projects/page.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx` (optional quick overview widget)

**Step 1: Assemble the `/projects` Page**
- Header banner with summary statistics (Total, In Progress, Blocked / Needs Attention, Completed).
- View switcher (Kanban Board vs All Projects Table).
- Search input, Priority filter, Assignee filter, and Customer filter.
- Floating / Header action buttons (`+ New Project`, `Import Notion`, `Export`).

**Step 2: Verification**
Run: `npm run build`
Expected: Build passes with zero errors and `/projects` route generated.
