"use client";

import React, { useState, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Tag, 
  AlertCircle, 
  PhoneCall, 
  Calendar, 
  FileCheck, 
  Trash2,
  Sparkles,
  AtSign,
  User
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { ActivityNote, NoteCategory } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo, getInitials } from "@/lib/utils";

interface ActivityFeedProps {
  customerId?: string;
  customerName?: string;
}

const categoryIcons: Record<NoteCategory, React.ElementType> = {
  general: MessageSquare,
  call_log: PhoneCall,
  meeting: Calendar,
  urgent: AlertCircle,
  contract: FileCheck,
};

const categoryColors: Record<NoteCategory, string> = {
  general: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  call_log: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  meeting: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  urgent: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  contract: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

export function ActivityFeed({ customerId, customerName }: ActivityFeedProps) {
  const { notes, addNote, deleteNote, currentUser, teamMembers } = useTenant();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("general");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Filter notes by customer if customerId provided
  const relevantNotes = notes.filter((n) => {
    const matchCustomer = customerId ? n.customerId === customerId : true;
    const matchFilter = selectedFilter === "all" ? true : n.category === selectedFilter;
    return matchCustomer && matchFilter;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Detect @ symbol for mention menu
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf("@");

    if (lastAt !== -1 && lastAt === textBeforeCursor.length - 1) {
      setShowMentionMenu(true);
      setMentionQuery("");
    } else if (lastAt !== -1 && !textBeforeCursor.slice(lastAt).includes(" ")) {
      setShowMentionMenu(true);
      setMentionQuery(textBeforeCursor.slice(lastAt + 1).toLowerCase());
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (member: (typeof teamMembers)[0]) => {
    const cursor = inputRef.current?.selectionStart || content.length;
    const textBeforeCursor = content.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf("@");
    const textAfterCursor = content.slice(cursor);

    const newContent = `${content.slice(0, lastAt)}@${member.displayName} ${textAfterCursor}`;
    setContent(newContent);
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Detect tagged users
    const taggedUserIds = teamMembers
      .filter((m) => content.includes(`@${m.displayName}`))
      .map((m) => m.uid);

    addNote({
      customerId: customerId || "general",
      customerName: customerName || "General CRM Note",
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      content,
      taggedUserIds,
      category,
      attachments: [],
    });

    setContent("");
    setShowMentionMenu(false);
  };

  return (
    <div className="space-y-5">
      {/* Note Composer Box */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              New Update / Team Note
            </span>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="text-xs h-8 px-2.5 rounded-lg border border-input bg-background font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="general">💬 General Update</option>
              <option value="call_log">📞 Phone Call Log</option>
              <option value="meeting">📅 Meeting Summary</option>
              <option value="contract">📑 Contract / SLA Note</option>
              <option value="urgent">🚨 Critical Alert</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={inputRef}
            rows={3}
            value={content}
            onChange={handleInputChange}
            placeholder="Type your notes here... Tip: type @ to tag team members (e.g. @Sarah Jenkins)"
            className="w-full bg-muted/40 border border-input rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />

          {/* Mention Autocomplete Dropdown */}
          {showMentionMenu && (
            <div className="absolute left-3 bottom-12 w-56 rounded-xl bg-card border border-border shadow-xl z-50 p-1.5 animate-in fade-in-0">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tag Team Member
              </div>
              {teamMembers
                .filter((m) => m.displayName.toLowerCase().includes(mentionQuery))
                .map((m) => (
                  <button
                    key={m.uid}
                    type="button"
                    onClick={() => handleSelectMention(m)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-left hover:bg-muted text-foreground transition-colors"
                  >
                    <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                      {getInitials(m.displayName)}
                    </div>
                    <span>{m.displayName}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <AtSign className="h-3 w-3 text-indigo-500" />
              <span>Type @ to tag team</span>
            </span>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            size="sm"
            variant="gradient"
            disabled={!content.trim()}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Post Note</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-muted-foreground font-medium text-[11px] mr-1">
          Filter:
        </span>
        {["all", "general", "call_log", "meeting", "contract", "urgent"].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
              selectedFilter === f
                ? "bg-primary text-primary-foreground shadow-sm text-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground text-xs"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Chronological Notes Timeline */}
      <div className="space-y-3">
        {relevantNotes.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/70 rounded-xl bg-card/40">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs font-medium text-muted-foreground">
              No activity notes recorded yet. Post the first update above!
            </p>
          </div>
        ) : (
          relevantNotes.map((note) => {
            const Icon = categoryIcons[note.category] || MessageSquare;
            return (
              <div
                key={note.id}
                className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-border transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/20">
                      {getInitials(note.authorName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {note.authorName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${
                            categoryColors[note.category]
                          }`}
                        >
                          {note.category.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(note.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded-md text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content with highlighted mentions */}
                <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed pl-1">
                  {note.content.split(" ").map((word, i) => {
                    if (word.startsWith("@")) {
                      return (
                        <span
                          key={i}
                          className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded mr-1"
                        >
                          {word}{" "}
                        </span>
                      );
                    }
                    return word + " ";
                  })}
                </p>

                {/* Attachments if present */}
                {note.attachments?.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-2">
                    {note.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-[11px] font-medium text-foreground border border-border"
                      >
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span>{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
