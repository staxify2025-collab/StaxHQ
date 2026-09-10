"use client";

import React, { useState, useMemo } from "react";
import { 
  ProjectCard, 
  ProjectStage, 
  ProjectPriority 
} from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { initialProjects } from "@/lib/demo/seedData";
import { ProjectKanbanBoard } from "@/components/projects/ProjectKanbanBoard";
import { ProjectTableView } from "@/components/projects/ProjectTableView";
import { ProjectCreatorModal } from "@/components/projects/ProjectCreatorModal";
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal";
import { NotionImportModal } from "@/components/projects/NotionImportModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  LayoutGrid, 
  ListFilter, 
  Table as TableIcon, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  PlayCircle, 
  Layers, 
  Building2,
  Calendar
} from "lucide-react";

export default function ProjectsPage() {
  const { 
    projects, 
    moveProjectStage, 
    deleteProject, 
    importProjects,
    customers,
    activeOrg 
  } = useTenant();

  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStage, setCreateInitialStage] = useState<ProjectStage>("in_progress");
  const [selectedProject, setSelectedProject] = useState<ProjectCard | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(q) ?? false;
      const descMatch = p.description?.toLowerCase().includes(q) ?? false;
      const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      const custMatch = p.customerName?.toLowerCase().includes(q) ?? false;
      const assigneeMatch = p.assignees?.some(
        (a) => a.name.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
      ) ?? false;

      const matchesSearch = !q || titleMatch || descMatch || tagMatch || custMatch || assigneeMatch;

      const matchesPriority =
        selectedPriority === "all" || p.priority === selectedPriority;

      const matchesStage =
        selectedStage === "all" || p.stage === selectedStage;

      const matchesAssignee =
        selectedAssignee === "all" ||
        p.assignees?.some((a) => a.name.toLowerCase() === selectedAssignee.toLowerCase());

      return matchesSearch && matchesPriority && matchesStage && matchesAssignee;
    });
  }, [projects, searchQuery, selectedPriority, selectedStage, selectedAssignee]);

  // Metric stats
  const totalCount = (projects || []).length;
  const inProgressCount = (projects || []).filter((p) => p.stage === "in_progress").length;
  const needsAttentionCount = (projects || []).filter((p) => p.stage === "needs_attention").length;
  const completedCount = (projects || []).filter((p) => p.stage === "completed").length;

  const handleOpenDetail = (project: ProjectCard) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleQuickAdd = (stage: ProjectStage) => {
    setCreateInitialStage(stage);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Projects & Roadmap
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Autonomous engineering pipelines, municipal software rollouts, and product architecture
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => importProjects(initialProjects)}
            className="text-xs font-bold gap-1.5 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 shadow-xs"
            title="Reload all 8 default Staxify projects"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload 8 Projects</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsNotionModalOpen(true)}
            className="text-xs font-bold gap-1.5 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Notion Sync / Snapshot</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setCreateInitialStage("in_progress");
              setIsCreateModalOpen(true);
            }}
            className="text-xs font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/25 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Total Initiatives
            </p>
            <p className="text-2xl font-black text-foreground mt-0.5">{totalCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              In Active Sprint
            </p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {inProgressCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PlayCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Needs Attention
            </p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {needsAttentionCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Delivered / Live
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {completedCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        {/* Left: View Switcher (Kanban vs Table) */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 self-start">
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === "kanban"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>All Projects (Table)</span>
          </button>
        </div>

        {/* Right: Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1 lg:justify-end">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects, tags, assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-background"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-8.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Stage Filter (if in table mode) */}
          {viewMode === "table" && (
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="h-8.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Stages</option>
              <option value="theory">Theory</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="needs_attention">Needs Attention</option>
              <option value="completed">Completed</option>
            </select>
          )}

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="h-8.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Assignees</option>
            <option value="JOSH">JOSH</option>
            <option value="Josh Norris">Josh Norris</option>
            <option value="Sarah">Sarah</option>
            <option value="Admin Operator">Admin Operator</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || selectedPriority !== "all" || selectedStage !== "all" || selectedAssignee !== "all") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedPriority("all");
                setSelectedStage("all");
                setSelectedAssignee("all");
              }}
              className="h-8.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Empty State Quick Restoration Banner */}
      {totalCount === 0 && (
        <div className="p-4.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Projects Board is Empty
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click below to instantly restore all 8 core engineering initiatives (GovStax, SPANLINK, RESTORE PRO, STAX ECHO, etc.) into your workspace.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => importProjects(initialProjects)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs gap-1.5 shadow-md shadow-indigo-500/20 shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Restore All 8 Projects</span>
          </Button>
        </div>
      )}

      {/* Main Board or Table Rendering */}
      {viewMode === "kanban" ? (
        <ProjectKanbanBoard
          projects={filteredProjects}
          onSelectProject={handleOpenDetail}
          onMoveStage={moveProjectStage}
          onDeleteProject={deleteProject}
          onQuickAdd={handleQuickAdd}
        />
      ) : (
        <ProjectTableView
          projects={filteredProjects}
          onSelectProject={handleOpenDetail}
          onMoveStage={moveProjectStage}
          onDeleteProject={deleteProject}
        />
      )}

      {/* Modals */}
      <ProjectCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialStage={createInitialStage}
      />

      <ProjectDetailModal
        project={selectedProject ? projects.find((p) => p.id === selectedProject.id) || selectedProject : null}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProject(null);
        }}
      />

      <NotionImportModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
      />
    </div>
  );
}
