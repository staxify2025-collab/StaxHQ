"use client";

import React, { useState, useEffect } from "react";
import { 
  ProjectCard, 
  ProjectStage, 
  ProjectPriority, 
  ProjectTaskItem, 
  ProjectNoteItem, 
  ProjectAssignee 
} from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FolderKanban, 
  CheckSquare, 
  Square, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Building2, 
  Calendar, 
  User, 
  Tag, 
  AlertTriangle, 
  Send, 
  Clock, 
  Sparkles,
  Layers,
  FileCheck
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ProjectDetailModalProps {
  project: ProjectCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAGES: { id: ProjectStage; label: string }[] = [
  { id: "theory", label: "💡 Theory / Concept" },
  { id: "not_started", label: "📋 Not Started" },
  { id: "in_progress", label: "⚡ In Progress" },
  { id: "needs_attention", label: "🚨 Needs Attention" },
  { id: "completed", label: "✅ Completed" },
];

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailModalProps) {
  const { 
    updateProject, 
    deleteProject, 
    addProjectNote, 
    toggleProjectTask, 
    customers, 
    teamMembers, 
    currentUser 
  } = useTenant();

  const [activeTab, setActiveTab] = useState<"overview" | "checklist" | "notes">("overview");

  // Editable Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<ProjectStage>("in_progress");
  const [priority, setPriority] = useState<ProjectPriority>("high");
  const [customerId, setCustomerId] = useState<string>("");
  const [targetDateStr, setTargetDateStr] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Subtask Input State
  const [newTaskText, setNewTaskText] = useState("");

  // Note Input State
  const [newNoteContent, setNewNoteContent] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setStage(project.stage || "in_progress");
      setPriority(project.priority || "high");
      setCustomerId(project.customerId || "");
      setSelectedAssignees(project.assignees?.map((a) => a.name) || []);
      setTags(project.tags || []);
      setTargetDateStr(
        project.targetLaunchDate
          ? new Date(project.targetLaunchDate).toISOString().split("T")[0]
          : ""
      );
      setActiveTab("overview");
    }
  }, [project]);

  if (!project) return null;

  const handleSaveOverview = () => {
    const selectedCust = customers.find((c) => c.id === customerId);
    const assignees: ProjectAssignee[] = selectedAssignees.map((name) => {
      const member = teamMembers.find((m) => m.displayName.toLowerCase() === name.toLowerCase());
      return {
        name,
        email: member?.email || (name.includes("@") ? name : undefined),
      };
    });

    const targetLaunchDate = targetDateStr ? new Date(targetDateStr).getTime() : undefined;

    updateProject(project.id, {
      title: title.trim() || project.title,
      description: description.trim() || undefined,
      stage,
      priority,
      customerId: selectedCust?.id,
      customerName: selectedCust?.name,
      assignees,
      tags,
      targetLaunchDate,
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;

    const newTask: ProjectTaskItem = {
      id: `task-${Date.now()}`,
      text: trimmed,
      completed: false,
    };

    const nextTasks = [...(project.tasks || []), newTask];
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const progressPercentage = Math.round((completedCount / nextTasks.length) * 100);

    updateProject(project.id, {
      tasks: nextTasks,
      progressPercentage,
    });

    setNewTaskText("");
  };

  const handleDeleteSubtask = (taskId: string) => {
    const nextTasks = (project.tasks || []).filter((t) => t.id !== taskId);
    const completedCount = nextTasks.filter((t) => t.completed).length;
    const progressPercentage =
      nextTasks.length > 0 ? Math.round((completedCount / nextTasks.length) * 100) : 0;

    updateProject(project.id, {
      tasks: nextTasks,
      progressPercentage,
    });
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    addProjectNote(project.id, newNoteContent.trim(), currentUser.displayName);
    setNewNoteContent("");
  };

  const toggleAssignee = (name: string) => {
    let updated: string[];
    if (selectedAssignees.includes(name)) {
      updated = selectedAssignees.filter((n) => n !== name);
    } else {
      updated = [...selectedAssignees, name];
    }
    setSelectedAssignees(updated);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const nextTags = [...tags, trimmed];
      setTags(nextTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const completedTasks = (project.tasks || []).filter((t) => t.completed).length;
  const totalTasks = (project.tasks || []).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl shadow-2xl">
        {/* Header with Title & Quick Badges */}
        <div className="p-6 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                  {project.stage.replace("_", " ").toUpperCase()}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
                  project.priority === "urgent"
                    ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                    : project.priority === "high"
                    ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
                    : "bg-indigo-500/15 text-indigo-700 border-indigo-500/30"
                }`}>
                  {project.priority.toUpperCase()} PRIORITY
                </span>
                {project.customerName && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    <Building2 className="h-3 w-3" />
                    {project.customerName}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight pt-1">
                {project.title}
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Overview & Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("checklist")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "checklist"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Checklist & Tasks ({completedTasks}/{totalTasks})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "notes"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Activity & Sprint Notes ({(project.notes || []).length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Title & Description */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Project Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="font-bold text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Description & Sprint Objective
                  </Label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Enter project deliverables, architecture, or scope..."
                  />
                </div>
              </div>

              {/* Grid: Stage, Priority, Customer, Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Roadmap Stage
                  </Label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as ProjectStage)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Priority Flag
                  </Label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">🚨 Urgent / Blocker</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>Attached Client</span>
                  </Label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Internal / Product Platform</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Target Delivery Date</span>
                  </Label>
                  <Input
                    type="date"
                    value={targetDateStr}
                    onChange={(e) => setTargetDateStr(e.target.value)}
                    className="text-xs font-medium"
                  />
                </div>
              </div>

              {/* Assignees */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Assignees</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["JOSH", "Josh Norris", "Sarah", "Admin Operator", "Marcus Vance"].map((name) => {
                    const isSelected = selectedAssignees.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleAssignee(name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {isSelected ? `✓ ${name}` : `+ ${name}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>Tags</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    className="text-xs font-semibold"
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        onClick={() => handleRemoveTag(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border cursor-pointer hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <span>{t}</span>
                        <span className="text-[10px] font-bold">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Overview Button */}
              <div className="pt-3 flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveOverview}
                  className="text-xs font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="space-y-5">
              {/* Progress Summary Header */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Checklist & Sprint Milestones
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {completedTasks} of {totalTasks} tasks completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
                  </p>
                </div>
                <div className="w-32 h-2.5 bg-muted rounded-full overflow-hidden border border-border/60">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <Input
                  placeholder="Add a new deliverable, task, or technical milestone..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-bold bg-primary text-primary-foreground shrink-0 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Task</span>
                </Button>
              </form>

              {/* Tasks List */}
              <div className="space-y-2">
                {(project.tasks || []).length > 0 ? (
                  (project.tasks || []).map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        task.completed
                          ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground line-through"
                          : "bg-card border-border/80 text-foreground"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleProjectTask(project.id, task.id)}
                        className="flex items-center gap-3 text-left flex-1"
                      >
                        {task.completed ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-xs font-semibold">{task.text}</span>
                      </button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubtask(task.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No tasks added yet. Add checklist items above to track progress!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-5">
              {/* Post Note Form */}
              <form onSubmit={handlePostNote} className="space-y-2 p-4 rounded-xl bg-muted/40 border border-border">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span>Log Activity / Meeting Notes / Blocker</span>
                </Label>
                <textarea
                  rows={2}
                  placeholder="Record sprint update, blocker resolution, or meeting discussion..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newNoteContent.trim()}
                    className="text-xs font-bold bg-primary text-primary-foreground gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Post Note</span>
                  </Button>
                </div>
              </form>

              {/* Notes Feed */}
              <div className="space-y-3">
                {(project.notes || []).length > 0 ? (
                  (project.notes || []).map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl bg-card border border-border/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                            {getInitials(note.authorName)}
                          </div>
                          <span className="font-bold text-foreground">{note.authorName}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(note.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed pl-8">
                        {note.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    No notes recorded yet. Post progress logs, meeting summaries, or blocker notes above.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Danger Zone */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
                deleteProject(project.id);
                onClose();
              }
            }}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Project</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
