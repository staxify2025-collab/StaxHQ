"use client";

import React, { useState } from "react";
import { ProjectCard, ProjectStage } from "@/types/crm";
import { ProjectCardItem } from "./ProjectCardItem";
import { Plus, Sparkles, AlertCircle, CheckCircle2, ListTodo, Lightbulb, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectKanbanBoardProps {
  projects: ProjectCard[];
  onSelectProject: (project: ProjectCard) => void;
  onMoveStage: (id: string, stage: ProjectStage) => void;
  onDeleteProject: (id: string) => void;
  onQuickAdd: (stage: ProjectStage) => void;
}

interface ColumnConfig {
  id: ProjectStage;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  headerBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "theory",
    title: "Theory / Concept",
    subtitle: "R&D, architecture & new ideas",
    icon: Lightbulb,
    headerBg: "bg-purple-500/10 dark:bg-purple-950/20",
    borderColor: "border-purple-500/30",
    badgeBg: "bg-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-300",
    accentColor: "border-t-purple-500",
  },
  {
    id: "not_started",
    title: "Not Started",
    subtitle: "Scoped & prioritized backlog",
    icon: ListTodo,
    headerBg: "bg-slate-500/10 dark:bg-slate-900/40",
    borderColor: "border-slate-500/30",
    badgeBg: "bg-slate-500/20",
    badgeText: "text-slate-700 dark:text-slate-300",
    accentColor: "border-t-slate-500",
  },
  {
    id: "in_progress",
    title: "In Progress",
    subtitle: "Active builds & team sprints",
    icon: PlayCircle,
    headerBg: "bg-indigo-500/10 dark:bg-indigo-950/20",
    borderColor: "border-indigo-500/30",
    badgeBg: "bg-indigo-500/20",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    accentColor: "border-t-indigo-500",
  },
  {
    id: "needs_attention",
    title: "Needs Attention",
    subtitle: "Blockers, critical bugs & review",
    icon: AlertCircle,
    headerBg: "bg-rose-500/10 dark:bg-rose-950/20",
    borderColor: "border-rose-500/30",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-700 dark:text-rose-300",
    accentColor: "border-t-rose-500",
  },
  {
    id: "completed",
    title: "Completed",
    subtitle: "Live in production & delivered",
    icon: CheckCircle2,
    headerBg: "bg-emerald-500/10 dark:bg-emerald-950/20",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    accentColor: "border-t-emerald-500",
  },
];

export function ProjectKanbanBoard({
  projects,
  onSelectProject,
  onMoveStage,
  onDeleteProject,
  onQuickAdd,
}: ProjectKanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStage | null>(null);

  const handleDragOver = (e: React.DragEvent, columnId: ProjectStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: ProjectStage) => {
    e.preventDefault();
    setDragOverColumn(null);
    const projectId = e.dataTransfer.getData("text/plain");
    if (projectId) {
      onMoveStage(projectId, columnId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4.5 pb-6 overflow-x-auto min-w-full items-start">
      {COLUMNS.map((col) => {
        const columnProjects = projects.filter((p) => p.stage === col.id);
        const Icon = col.icon;
        const isTargeted = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl bg-muted/30 border border-t-4 ${col.accentColor} transition-all duration-200 min-h-[580px] p-3 ${
              isTargeted
                ? "bg-primary/5 border-primary ring-2 ring-primary/20 scale-[1.01]"
                : "border-border/70"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${col.headerBg} border ${col.borderColor}`}>
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5">
                    {col.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium hidden 2xl:block">
                    {col.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}
                >
                  {columnProjects.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onQuickAdd(col.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                  title={`Add to ${col.title}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Card Stack */}
            <div className="flex-1 space-y-3">
              {columnProjects.map((project) => (
                <ProjectCardItem
                  key={project.id}
                  project={project}
                  onSelect={onSelectProject}
                  onMoveStage={onMoveStage}
                  onDelete={onDeleteProject}
                />
              ))}

              {columnProjects.length === 0 && (
                <div
                  onClick={() => onQuickAdd(col.id)}
                  className="h-28 rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors group"
                >
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary mb-1 transition-colors" />
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    + New Project
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                    Drop cards here or click to create
                  </span>
                </div>
              )}
            </div>

            {/* Quick Add Button at bottom of column */}
            {columnProjects.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onQuickAdd(col.id)}
                className="w-full mt-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium justify-start gap-1.5 border border-dashed border-transparent hover:border-border/70 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add project</span>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
