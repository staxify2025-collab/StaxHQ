"use client";

import React, { useState } from "react";
import { 
  ProjectCard, 
  ProjectStage, 
  ProjectPriority, 
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
  Plus, 
  Sparkles, 
  Building2, 
  User, 
  Tag, 
  Calendar,
  AlertTriangle 
} from "lucide-react";

interface ProjectCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStage?: ProjectStage;
}

const STAGES: { id: ProjectStage; label: string }[] = [
  { id: "theory", label: "💡 Theory / Concept" },
  { id: "not_started", label: "📋 Not Started" },
  { id: "in_progress", label: "⚡ In Progress" },
  { id: "needs_attention", label: "🚨 Needs Attention" },
  { id: "completed", label: "✅ Completed" },
];

export function ProjectCreatorModal({
  isOpen,
  onClose,
  initialStage = "in_progress",
}: ProjectCreatorModalProps) {
  const { addProject, customers, teamMembers } = useTenant();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<ProjectStage>(initialStage);
  const [priority, setPriority] = useState<ProjectPriority>("high");
  const [customerId, setCustomerId] = useState<string>("");
  const [selectedAssigneeNames, setSelectedAssigneeNames] = useState<string[]>(["JOSH"]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [targetDateStr, setTargetDateStr] = useState("");

  // Sync initialStage when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStage(initialStage);
    }
  }, [isOpen, initialStage]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleAssignee = (name: string) => {
    if (selectedAssigneeNames.includes(name)) {
      setSelectedAssigneeNames(selectedAssigneeNames.filter((n) => n !== name));
    } else {
      setSelectedAssigneeNames([...selectedAssigneeNames, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCustomer = customers.find((c) => c.id === customerId);

    const assignees: ProjectAssignee[] = selectedAssigneeNames.map((name) => {
      const member = teamMembers.find((m) => m.displayName.toLowerCase() === name.toLowerCase());
      return {
        name,
        email: member?.email || (name.includes("@") ? name : undefined),
      };
    });

    const targetLaunchDate = targetDateStr ? new Date(targetDateStr).getTime() : undefined;

    addProject({
      title: title.trim(),
      description: description.trim() || undefined,
      stage,
      priority,
      assignees,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      tags: tags.length > 0 ? tags : [title.trim().toUpperCase()],
      tasks: [],
      notes: [],
      progressPercentage: 0,
      targetLaunchDate,
    });

    // Reset and close
    setTitle("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setTargetDateStr("");
    setCustomerId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Create New Project Card
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Add an initiative, internal engineering sprint, or customer deployment to the roadmap.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Project Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="proj-title"
              placeholder="e.g. GovStax Mobile Dispatch or SPANLINK Bridge"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="font-semibold text-sm"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="proj-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description & Objective
            </Label>
            <textarea
              id="proj-desc"
              rows={2}
              placeholder="Key deliverables, system architecture, or sprint goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Stage & Priority Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pipeline Stage
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
                Priority Level
              </Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">🚨 Urgent / Blocker</option>
              </select>
            </div>
          </div>

          {/* Customer Link & Target Launch Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>Link Client Account</span>
              </Label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Internal / Product Platform</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.primaryProduct || "Client"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Target Launch Date</span>
              </Label>
              <Input
                id="proj-date"
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                className="text-xs font-medium"
              />
            </div>
          </div>

          {/* Assignees Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Assignees</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {["JOSH", "Josh Norris", "Sarah", "Admin Operator", "Marcus Vance"].map((name) => {
                const isSelected = selectedAssigneeNames.includes(name);
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
              <span>Tags & Categories</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AI, Municipal, Telemetry, Mobile"
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
                className="text-xs font-semibold shrink-0"
              >
                Add Tag
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => handleRemoveTag(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/50 transition-colors"
                    title="Click to remove tag"
                  >
                    <span>{t}</span>
                    <span className="text-[10px] font-bold">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-xs font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/25"
            >
              Create Project Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
