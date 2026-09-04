# Projects & Roadmap Design Document

## Overview
Transform Staxify into the primary standalone workspace for all internal and client project tracking, replacing Notion. Introduce a high-performance, interactive Kanban pipeline and Roadmap module called **"Projects & Roadmap"** integrated natively into Staxify's navigation, data store, and client CRM ecosystem.

---

## 1. Requirements & User Workflow

### User Goals
1. Transition off Notion to Staxify as the primary, standalone project hub.
2. Track engineering, client deployments, and internal products through 5 key stages:
   - 💡 **Theory / Concept** (Ideation & architecture)
   - 📋 **Not Started** (Queued backlog)
   - ⚡ **In Progress** (Active sprints)
   - 🚨 **Needs Attention** (Blockers, review needed, urgent issues)
   - ✅ **Completed / Shipped** (Done & live)
3. Maintain full card capabilities: assignees (Josh, team emails), priority flags (Low, Medium, High, Urgent), notes & updates feed, checklist tasks, and linking projects directly to Staxify Customers & Contracts.
4. Support instant migration from Notion (with pre-populated initial seed data representing existing Notion cards like `GovStax`, `SPANLINK`, `RESTORE PRO`, `COMMUNITY CONNECT`, `SENIOR CARE "TELS" PROJECT`, etc.).

---

## 2. Architecture & Data Model

### Data Type: `ProjectCard` in `src/types/crm.ts`
```typescript
export type ProjectStage = 
  | 'theory' 
  | 'not_started' 
  | 'in_progress' 
  | 'needs_attention' 
  | 'completed';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectNoteItem {
  id: string;
  authorId?: string;
  authorName: string;
  content: string;
  createdAt: number;
}

export interface ProjectCard {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  stage: ProjectStage;
  priority: ProjectPriority;
  assignees: {
    name: string;
    email?: string;
    avatar?: string;
  }[];
  customerId?: string; // Optional link to Staxify Customer
  customerName?: string;
  tags: string[];
  tasks: ProjectTaskItem[];
  notes: ProjectNoteItem[];
  progressPercentage?: number;
  targetLaunchDate?: number;
  createdAt: number;
  updatedAt: number;
}
```

---

## 3. UI/UX & Component Architecture

1. **Navigation Item**:
   - Position: Left Sidebar (`src/components/layout/AppSidebar.tsx`) between **Customers & Pipeline** and **Documents & Contracts**.
   - Icon: `Kanban` / `FolderKanban` / `Layers`.
   - Badge: Dynamic active project count.

2. **Main Page (`src/app/(app)/projects/page.tsx`)**:
   - Header with title, stats summary (Active Projects, Blocked/Needs Attention, Completed), search & filter bar, view switcher (Kanban Board vs. Table List).
   - Quick action buttons: `+ New Project`, `Import / Sync Notion`, `Export JSON`.

3. **Kanban Board Component (`src/components/projects/ProjectKanbanBoard.tsx`)**:
   - 5 stylized stage columns with counts and quick "Add card" shortcut.
   - Smooth drag-and-drop support (HTML5 draggable + drop target states) and one-click stage switcher menu.
   - Rich card preview with priority pill, assignee avatars/emails, customer link badge, checklist status, and notes count.

4. **Project Detail & Editor Modal (`src/components/projects/ProjectDetailModal.tsx`)**:
   - Edit title, stage, priority, target date, customer association, tags.
   - Interactive checklist manager (add, toggle, remove).
   - Timestamped Activity & Notes feed (add progress updates and blocker logs).

5. **Project Creator Modal (`src/components/projects/ProjectCreatorModal.tsx`)**:
   - Quick project registration with instant column assignment.

6. **Notion Importer & Data Tool (`src/components/projects/NotionImportModal.tsx`)**:
   - 1-Click Notion snapshot seeder & custom JSON importer.

---

## 4. Initial Seed Data (From Notion Board)
Pre-seed all cards captured from the user's Notion board:
* `GovStax` (In Progress, High Priority, Assignees: JOSH, sjanejack@gmail.com, jnorris@staxifytech.com)
* `SPANLINK` (In Progress, High Priority, Assignee: JOSH)
* `RESTORE PRO` (In Progress, High Priority, Assignee: jnorris@staxifytech.com)
* `COMMUNITY CONNECT` (In Progress, Medium Priority, Assignee: jnorris@staxifytech.com)
* `SENIOR CARE "TELS" PROJECT` (Not Started / Theory, Low Priority, Assignee: JOSH)
* Additional sample project concepts in Theory, Needs Attention, and Completed stages.

---

## 5. Verification & Testing
- Verify typecheck passes cleanly (`npm run typecheck` / `npm run build`).
- Validate drag-and-drop state persistence across demo and primary organization modes.
- Verify adding/updating/deleting notes, tasks, and priority tags.
