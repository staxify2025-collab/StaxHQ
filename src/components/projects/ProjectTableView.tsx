"use client";

import React, { useState } from "react";
import { ProjectCard, ProjectStage, ProjectPriority } from "@/types/crm";
import { 
  Building2, 
  CheckSquare, 
  MessageSquare, 
  MoreVertical, 
  AlertTriangle,
  Clock,
  ArrowUpDown,
  MoveRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface ProjectTableViewProps {
  projects: ProjectCard[];
  onSelectProject: (project: ProjectCard) => void;
  onMoveStage: (id: string, stage: ProjectStage) => void;
  onDeleteProject: (id: string) => void;
}

const STAGES: { id: ProjectStage; label: string }[] = [
  { id: "theory", label: "💡 Theory / Concept" },
  { id: "not_started", label: "📋 Not Started" },
  { id: "in_progress", label: "⚡ In Progress" },
  { id: "needs_attention", label: "🚨 Needs Attention" },
  { id: "completed", label: "✅ Completed" },
];

export function ProjectTableView({
  projects,
  onSelectProject,
  onMoveStage,
  onDeleteProject,
}: ProjectTableViewProps) {
  const [sortField, setSortField] = useState<keyof ProjectCard>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof ProjectCard) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let aVal = a[sortField] || "";
    let bVal = b[sortField] || "";
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const getStageBadge = (stage: ProjectStage) => {
    switch (stage) {
      case "theory":
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">💡 Theory</span>;
      case "not_started":
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">📋 Not Started</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">⚡ In Progress</span>;
      case "needs_attention":
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">🚨 Needs Attention</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">✅ Completed</span>;
    }
  };

  const getPriorityBadge = (priority: ProjectPriority) => {
    switch (priority) {
      case "urgent":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">Urgent</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">Medium</span>;
      case "low":
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">Low</span>;
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-bold">
            <tr>
              <th className="py-3 px-4 cursor-pointer hover:text-foreground" onClick={() => handleSort("title")}>
                <div className="flex items-center gap-1.5">
                  <span>Project Name</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-foreground" onClick={() => handleSort("stage")}>
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-foreground" onClick={() => handleSort("priority")}>
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="py-3 px-4">Assignees</th>
              <th className="py-3 px-4">Customer Account</th>
              <th className="py-3 px-4">Tasks Progress</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sortedProjects.map((project) => {
              const completedTasks = (project.tasks || []).filter((t) => t.completed).length;
              const totalTasks = (project.tasks || []).length;
              const notesCount = (project.notes || []).length;

              return (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      <span>{project.title}</span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStageBadge(project.stage)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityBadge(project.priority)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {project.assignees && project.assignees.length > 0 ? (
                        project.assignees.map((a, idx) => (
                          <div
                            key={idx}
                            title={`${a.name}${a.email ? ` (${a.email})` : ""}`}
                            className="h-6 w-6 rounded-full bg-slate-800 border-2 border-card text-white text-[9px] font-extrabold flex items-center justify-center"
                          >
                            {getInitials(a.name || "User")}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {project.customerName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/40">
                        <Building2 className="h-3 w-3" />
                        {project.customerName}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 min-w-[140px]">
                    {totalTasks > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                          <span>{completedTasks}/{totalTasks}</span>
                          <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.round((completedTasks / totalTasks) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">0 tasks</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {notesCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {notesCount}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onSelectProject(project)}>
                          Open Details
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="text-xs">
                            <MoveRight className="h-3.5 w-3.5 mr-2" />
                            Move Stage
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup
                              value={project.stage}
                              onValueChange={(val: string) => onMoveStage(project.id, val as ProjectStage)}
                            >
                              {STAGES.map((s) => (
                                <DropdownMenuRadioItem key={s.id} value={s.id} className="text-xs">
                                  {s.label}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteProject(project.id)}
                          className="text-rose-600 dark:text-rose-400 text-xs font-semibold"
                        >
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
