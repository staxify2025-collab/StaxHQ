"use client";

import React, { useState } from "react";
import { ProjectCard } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { initialProjects } from "@/lib/demo/seedData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  RefreshCw,
  Layers,
  ArrowRight
} from "lucide-react";

interface NotionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotionImportModal({
  isOpen,
  onClose,
}: NotionImportModalProps) {
  const { projects, importProjects, sendNotification } = useTenant();
  const [jsonInput, setJsonInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handle1ClickNotionSeed = () => {
    importProjects(initialProjects);
    setSuccessMsg(`Successfully imported ${initialProjects.length} projects from Notion snapshot!`);
    sendNotification({
      recipientUserId: "all",
      type: "system",
      title: "🚀 Notion Migration Complete",
      messageSnippet: `Imported ${initialProjects.length} projects into Projects & Roadmap.`,
      targetUrl: "/projects",
    });
    setTimeout(() => {
      onClose();
      setSuccessMsg("");
    }, 1200);
  };

  const handleJsonImport = () => {
    try {
      setErrorMsg("");
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of project card objects.");
      }
      importProjects(parsed);
      setSuccessMsg(`Successfully imported ${parsed.length} custom projects!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg("");
        setJsonInput("");
      }, 1200);
    } catch (e: any) {
      setErrorMsg(e.message || "Invalid JSON format. Please verify the structure.");
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `staxify-projects-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Notion Migration & Project Sync
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Import from your existing Notion database or export backups.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {/* 1-Click Notion Migration Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>1-Click Notion Snapshot Migration</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Instantly import all projects captured from your Notion workspace (GovStax, SPANLINK, RESTORE PRO, COMMUNITY CONNECT, SENIOR CARE, etc.).
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handle1ClickNotionSeed}
              className="w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Import Notion Snapshot ({initialProjects.length} Cards)</span>
            </Button>
          </div>

          {/* JSON Paste Area */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Custom JSON Import
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleExportJson}
                className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Current ({projects.length})</span>
              </Button>
            </div>

            <textarea
              rows={4}
              placeholder="Paste JSON array of project cards here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />

            {jsonInput && (
              <Button
                type="button"
                size="sm"
                onClick={handleJsonImport}
                className="w-full text-xs font-bold bg-primary text-primary-foreground gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Parse and Import JSON</span>
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
