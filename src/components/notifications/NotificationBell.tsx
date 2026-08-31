"use client";

import React, { useState } from "react";
import { Bell, MessageSquare, Check, Sparkles } from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { formatTimeAgo } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notes, currentUser } = useTenant();

  // Find notes where current user is tagged or recent urgent updates
  const recentAlerts = notes
    .filter((n) => n.taggedUserIds.length > 0 || n.category === "urgent")
    .slice(0, 5);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {recentAlerts.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
        )}
        {recentAlerts.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border/80 shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="p-3 border-b border-border/60 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Team Activity & Alerts
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
              {recentAlerts.length} new
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-border/40">
            {recentAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No new unread team mentions.
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-foreground">
                      {alert.authorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {alert.content}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                    <MessageSquare className="h-3 w-3" />
                    <span>{alert.customerName || "Customer Note"}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
