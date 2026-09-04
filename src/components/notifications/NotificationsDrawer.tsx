"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  FileSignature,
  AlertTriangle,
  Sparkles,
  Volume2,
  ShieldCheck,
  Trash2,
  Layers,
  Clock,
  CheckCircle2,
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

export function NotificationsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>("default");

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

  useEffect(() => {
    setPermissionStatus(getPushPermissionStatus());
  }, []);

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
      title: `Test Team Alert from ${currentUser.displayName}`,
      messageSnippet: "Notification chime and browser push verified successfully in StaxHQ!",
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
    <>
      {/* Top Header Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        title="Team Activity & Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm animate-pulse">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        )}
      </button>

      {/* Slide-over Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl h-full flex flex-col z-50 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-border/80 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Team Activity & Alerts</span>
                    {unreadNotificationCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5 font-bold">
                        {unreadNotificationCount}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Real-time mentions, contract signatures & alerts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadNotificationCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllNotificationsRead}
                    className="h-8 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1 px-2 font-medium"
                    title="Mark All Read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mark Read</span>
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Push Notification Permission Banner */}
            {permissionStatus === "default" && (
              <div className="p-3 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                  <Volume2 className="h-4 w-4 shrink-0" />
                  <span>Enable desktop push alerts & chimes?</span>
                </div>
                <Button
                  onClick={handleEnablePush}
                  size="sm"
                  variant="gradient"
                  className="h-7 text-[10px] px-2.5 font-semibold shrink-0"
                >
                  Enable Push
                </Button>
              </div>
            )}

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-border/30">
              {notifications.filter((n) => !n.read).length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-30 text-indigo-500" />
                  <p className="text-sm font-semibold text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    When teammates @mention you or client contracts are signed, alerts will appear here.
                  </p>
                  <Button
                    onClick={handleTestAlert}
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-1.5 text-xs"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Send Test Alert Chime</span>
                  </Button>
                </div>
              ) : (
                notifications
                  .filter((n) => !n.read)
                  .map((notif) => {
                    const isUnread = !notif.read;
                  return (
                    <div
                      key={notif.id}
                      className={`pt-2.5 first:pt-0 rounded-xl p-3.5 transition-all border ${
                        isUnread
                          ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 shadow-sm"
                          : "bg-card border-border/60 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-card border border-border/80 flex items-center justify-center shrink-0 mt-0.5">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground">
                                {notif.title}
                              </span>
                              {isUnread && (
                                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
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
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Snippet */}
                      <p className="text-xs text-foreground/90 mt-2 pl-9 leading-relaxed">
                        {notif.messageSnippet}
                      </p>

                      {/* Card Actions */}
                      <div className="mt-2.5 pl-9 flex items-center gap-2">
                        {notif.targetUrl && (
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
                              {notif.customerName
                                ? `Open ${notif.customerName}`
                                : "View Record"}
                            </span>
                          </Link>
                        )}

                        {isUnread && (
                          <button
                            onClick={() => markNotificationRead(notif.id)}
                            className="text-[11px] text-muted-foreground hover:text-foreground font-medium ml-auto"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-border/80 bg-muted/20 flex items-center justify-between text-xs">
              <Button
                onClick={handleTestAlert}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <Volume2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>Test Audio & Push</span>
              </Button>

              {notifications.length > 0 && (
                <Button
                  onClick={clearAllNotifications}
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-muted-foreground hover:text-rose-600 h-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
