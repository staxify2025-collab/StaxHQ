"use client";

import React, { useState } from "react";
import { 
  ProjectCard, 
  ProjectStage, 
  ProjectPriority 
} from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  MessageSquare, 
  Building2, 
  MoreVertical, 
  Clock, 
  Sparkles, 
  ChevronRight,
  AlertTriangle,
  MoveRight,
  GripVertical
} from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface ProjectCardItemProps {
  project: ProjectCard;
  onSelect: (project: ProjectCard) => void;
  onMoveStage: (id: string, stage: ProjectStage) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

const STAGES: { id: ProjectStage; label: string }[] = [
  { id: "theory", label: "💡 Theory / Concept" },
  { id: "not_started", label: "📋 Not Started" },
  { id: "in_progress", label: "⚡ In Progress" },
  { id: "needs_attention", label: "🚨 Needs Attention" },
  { id: "completed", label: "✅ Completed" },
];

export function ProjectCardItem({
  project,
  onSelect,
  onMoveStage,
  onDelete,
}: ProjectCardItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const getPriorityBadge = (priority: ProjectPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5" />
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
            Medium
          </span>
        );
      case "low":
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            Low
          </span>
        );
    }
  };

  const completedTasks = (project.tasks || []).filter((t) => t.completed).length;
  const totalTasks = (project.tasks || []).length;
  const notesCount = (project.notes || []).length;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", project.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(project)}
      className="group relative bg-card/90 hover:bg-card border border-border/80 hover:border-primary/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer space-y-3"
    >
      {/* Top Meta Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getPriorityBadge(project.priority)}
          {project.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Menu */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
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
              <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">
                Project Actions
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onSelect(project)}>
                Open Details & Notes
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs">
                  <MoveRight className="h-3.5 w-3.5 mr-2" />
                  Move to Stage
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
                onClick={() => onDelete(project.id)}
                className="text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/50 text-xs font-semibold"
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Title */}
      <div>
        <h4 className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
          {project.title}
        </h4>
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Linked Customer (if applicable) */}
      {project.customerName && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-200/50 dark:border-indigo-800/40">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{project.customerName}</span>
        </div>
      )}

      {/* Checklist Progress Bar */}
      {totalTasks > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3 text-primary" />
              <span>{completedTasks}/{totalTasks} tasks</span>
            </span>
            <span className="text-[10px] font-bold text-foreground">
              {Math.round((completedTasks / totalTasks) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                completedTasks === totalTasks
                  ? "bg-emerald-500"
                  : project.stage === "needs_attention"
                  ? "bg-amber-500"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.round((completedTasks / totalTasks) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Row: Assignees & Meta Counters */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs text-muted-foreground">
        {/* Assignees */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {project.assignees && project.assignees.length > 0 ? (
            project.assignees.map((a, idx) => (
              <div
                key={idx}
                title={`${a.name}${a.email ? ` (${a.email})` : ""}`}
                className="h-6 w-6 rounded-full bg-slate-800 border-2 border-card text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs"
              >
                {getInitials(a.name || "User")}
              </div>
            ))
          ) : (
            <span className="text-[10px] italic text-muted-foreground/70">Unassigned</span>
          )}
        </div>

        {/* Notes counter & launch date */}
        <div className="flex items-center gap-2.5">
          {notesCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground" title={`${notesCount} Activity Notes`}>
              <MessageSquare className="h-3 w-3" />
              <span>{notesCount}</span>
            </div>
          )}

          {project.targetLaunchDate && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(project.targetLaunchDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
