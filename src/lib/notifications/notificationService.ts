import { playNotificationChime, playUrgentAlertSound } from "./notificationSound";
import { AppNotification } from "@/types/crm";

export type PushPermissionStatus = "default" | "granted" | "denied" | "unsupported";

/**
 * Checks if browser push notifications are supported
 */
export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Returns current permission status
 */
export function getPushPermissionStatus(): PushPermissionStatus {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission as PushPermissionStatus;
}

/**
 * Requests browser push permission from the user
 */
export async function requestPushPermission(): Promise<PushPermissionStatus> {
  if (!isPushSupported()) return "unsupported";
  try {
    const permission = await Notification.requestPermission();
    return permission as PushPermissionStatus;
  } catch (err) {
    console.warn("Failed to request push notification permission:", err);
    return "denied";
  }
}

/**
 * Displays a native desktop/browser push notification banner
 */
export function triggerBrowserPushBanner({
  title,
  body,
  tag,
  icon,
  onClickUrl,
}: {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  onClickUrl?: string;
}) {
  if (!isPushSupported()) return;

  if (Notification.permission === "granted") {
    try {
      const banner = new Notification(title, {
        body,
        tag: tag || `stax-notif-${Date.now()}`,
        icon: icon || "/stax-logo.png",
      });

      if (onClickUrl) {
        banner.onclick = () => {
          window.focus();
          if (typeof window !== "undefined") {
            window.location.href = onClickUrl;
          }
          banner.close();
        };
      }
    } catch (err) {
      console.warn("Could not display native notification banner:", err);
    }
  }
}

/**
 * Plays sound chime and triggers native push banner for a newly arrived notification
 */
export function dispatchNotificationWithAlert(
  notification: AppNotification,
  playAudio: boolean = true
) {
  // 1. Play audio chime strictly for digital signature events
  if (playAudio && notification.type === "contract_signed") {
    playNotificationChime();
  }

  // 2. Trigger native desktop push banner
  const typeIcons: Record<string, string> = {
    mention: "💬",
    contract_signed: "✍️",
    contract_pending: "⏳",
    urgent_alert: "⚠️",
    customer_milestone: "🎉",
    system: "🔔",
  };

  const iconPrefix = typeIcons[notification.type] || "🔔";
  const title = `${iconPrefix} ${notification.title}`;

  triggerBrowserPushBanner({
    title,
    body: notification.messageSnippet,
    tag: notification.id,
    onClickUrl: notification.targetUrl,
  });
}
