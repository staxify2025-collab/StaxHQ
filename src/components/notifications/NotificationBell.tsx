"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Volume2,
  Trash2,
  Clock,
  CheckCircle2,
  Layers,
  FileCheck2,
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppNotification, NotificationType } from "@/types/crm";
import { formatTimeAgo } from "@/lib/utils";
import {
  playNotificationChime,
  playUrgentAlertSound,
} from "@/lib/notifications/notificationSound";
import {
  getPushPermissionStatus,
  requestPushPermission,
  PushPermissionStatus,
} from "@/lib/notifications/notificationService";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>("default");
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotification,
    currentUser,
  } = useTenant();

  // Active unread alerts
  const activeAlerts = (notifications || []).filter((n) => !n.read);

  useEffect(() => {
    setPermissionStatus(getPushPermissionStatus());
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleEnablePush = async () => {
    const status = await requestPushPermission();
    setPermissionStatus(status);
    if (status === "granted") {
      playNotificationChime();
    }
  };

  const handleTestAlert = () => {
    sendNotification({
      recipientUserId: "all",
      senderUserId: currentUser.uid,
      senderName: currentUser.displayName,
      type: "mention",
      title: `Team Notification from ${currentUser.displayName}`,
      messageSnippet: "Notification audio chime and desktop push verified in StaxHQ!",
      targetUrl: "/documents",
    });
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "mention":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case "contract_signed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "contract_pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "urgent_alert":
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case "customer_milestone":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case "system":
      default:
        return <Bell className="h-4 w-4 text-indigo-600" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        title="Team Activity & Notifications"
      >
        <Bell className="h-4 w-4" />
        {activeAlerts.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm animate-pulse">
            {activeAlerts.length > 9 ? "9+" : activeAlerts.length}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border/80 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="p-3.5 border-b border-border/80 bg-muted/25 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Bell className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Team Activity & Alerts
              </span>
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5 font-bold">
                  {activeAlerts.length}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {activeAlerts.length > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mr-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Optional Push Permission Banner */}
          {permissionStatus === "default" && (
            <div className="p-2.5 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                Enable desktop push alerts?
              </span>
              <button
                onClick={handleEnablePush}
                className="px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold text-[10px] hover:bg-indigo-700 shadow-sm"
              >
                Enable
              </button>
            </div>
          )}

          {/* Active Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40 p-2 space-y-1.5">
            {activeAlerts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-7 w-7 mx-auto mb-1.5 text-emerald-500/70" />
                <p className="text-xs font-semibold text-foreground">All caught up!</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  No active unread alerts right now.
                </p>
                <Button
                  onClick={handleTestAlert}
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5 text-[11px] h-7"
                >
                  <Volume2 className="h-3 w-3 text-indigo-500" />
                  <span>Send Test Alert Chime</span>
                </Button>
              </div>
            ) : (
              activeAlerts.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 hover:border-indigo-500/40 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="h-6 w-6 rounded-lg bg-card border border-border/80 flex items-center justify-center shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-foreground truncate">
                            {notif.title}
                          </h5>
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {notif.senderName && (
                            <span className="font-semibold text-foreground">
                              {notif.senderName} •{" "}
                            </span>
                          )}
                          {formatTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Mark as read (remove)"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-foreground/90 mt-1.5 pl-8 leading-relaxed">
                    {notif.messageSnippet}
                  </p>

                  <div className="mt-2 pl-8 flex items-center justify-between">
                    {notif.targetUrl ? (
                      <Link
                        href={notif.targetUrl}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>
                          {notif.customerName ? `Open ${notif.customerName}` : "View Record"}
                        </span>
                      </Link>
                    ) : <span />}

                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-foreground underline decoration-dotted"
                    >
                      Mark as read
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-2.5 border-t border-border/80 bg-muted/25 flex items-center justify-between text-xs">
            <button
              onClick={handleTestAlert}
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
            >
              <Volume2 className="h-3 w-3 text-indigo-500" />
              <span>Test Chime</span>
            </button>

            {activeAlerts.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] text-muted-foreground hover:text-rose-600 font-medium flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>Dismiss All</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
