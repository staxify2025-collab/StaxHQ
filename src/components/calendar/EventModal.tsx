"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent, EventType } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Building2, 
  Users, 
  Bell, 
  ExternalLink, 
  Download, 
  Trash2, 
  Check, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { 
  generateGoogleCalendarUrl, 
  downloadIcsFile, 
  formatDate 
} from "@/lib/utils";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialData?: CalendarEvent;
}

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "15", "30", "45"];

export function EventModal({ 
  isOpen, 
  onClose, 
  initialDate, 
  initialData 
}: EventModalProps) {
  const { 
    customers, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    teamMembers, 
    currentUser,
    sendNotification
  } = useTenant();

  const isEditMode = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [customerId, setCustomerId] = useState(initialData?.customerId || "");
  const [type, setType] = useState<EventType>(initialData?.type || "meeting");
  
  // Date handling
  const [dateStr, setDateStr] = useState(() => {
    if (initialData?.start) {
      return new Date(initialData.start).toISOString().split("T")[0];
    }
    if (initialDate) {
      return initialDate.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });

  // Time States
  const [startHour, setStartHour] = useState("01");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("PM");

  const [endHour, setEndHour] = useState("02");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");

  const [description, setDescription] = useState(initialData?.description || "");
  const [attendeeIds, setAttendeeIds] = useState<string[]>(
    initialData?.attendeeUserIds || [currentUser.uid]
  );
  const [reminderMinutes, setReminderMinutes] = useState<number>(
    initialData?.reminderMinutes ?? 30
  );

  // Initialize from initialData or initialDate
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCustomerId(initialData.customerId || "");
      setType(initialData.type || "meeting");
      setDescription(initialData.description || "");
      setAttendeeIds(initialData.attendeeUserIds || [currentUser.uid]);
      setReminderMinutes(initialData.reminderMinutes ?? 30);

      const sDate = new Date(initialData.start);
      setDateStr(sDate.toISOString().split("T")[0]);

      let sH = sDate.getHours();
      const sP = sH >= 12 ? "PM" : "AM";
      sH = sH % 12 === 0 ? 12 : sH % 12;
      setStartHour(String(sH).padStart(2, "0"));
      // Round minute to nearest 15
      const sM = Math.round(sDate.getMinutes() / 15) * 15 % 60;
      setStartMinute(String(sM).padStart(2, "0"));
      setStartPeriod(sP);

      const eDate = new Date(initialData.end);
      let eH = eDate.getHours();
      const eP = eH >= 12 ? "PM" : "AM";
      eH = eH % 12 === 0 ? 12 : eH % 12;
      setEndHour(String(eH).padStart(2, "0"));
      const eM = Math.round(eDate.getMinutes() / 15) * 15 % 60;
      setEndMinute(String(eM).padStart(2, "0"));
      setEndPeriod(eP);
    } else {
      setTitle("");
      setCustomerId("");
      setType("meeting");
      setDescription("");
      setAttendeeIds([currentUser.uid]);
      setReminderMinutes(30);

      if (initialDate) {
        setDateStr(initialDate.toISOString().split("T")[0]);
      } else {
        setDateStr(new Date().toISOString().split("T")[0]);
      }
      setStartHour("01");
      setStartMinute("00");
      setStartPeriod("PM");
      setEndHour("02");
      setEndMinute("00");
      setEndPeriod("PM");
    }
  }, [initialData, initialDate, currentUser.uid, isOpen]);

  // Automatically auto-advance End Time by +1 hour when Start Time is changed
  const handleStartTimeChange = (newHour: string, newMinute: string, newPeriod: "AM" | "PM") => {
    setStartHour(newHour);
    setStartMinute(newMinute);
    setStartPeriod(newPeriod);

    // Calculate +1 hour
    const hNum = parseInt(newHour, 10);
    const mNum = parseInt(newMinute, 10);
    const hour24 = (hNum % 12) + (newPeriod === "PM" ? 12 : 0);
    const totalMin = hour24 * 60 + mNum;
    const endTotalMin = (totalMin + 60) % 1440;

    const endHour24 = Math.floor(endTotalMin / 60);
    const endMin = endTotalMin % 60;
    const computedEndP = endHour24 >= 12 ? "PM" : "AM";
    const computedEndH = endHour24 % 12 === 0 ? 12 : endHour24 % 12;

    setEndHour(String(computedEndH).padStart(2, "0"));
    setEndMinute(String(endMin).padStart(2, "0"));
    setEndPeriod(computedEndP);
  };

  const getTimestamps = () => {
    const sH = parseInt(startHour, 10);
    const sM = parseInt(startMinute, 10);
    const sHour24 = (sH % 12) + (startPeriod === "PM" ? 12 : 0);

    const eH = parseInt(endHour, 10);
    const eM = parseInt(endMinute, 10);
    const eHour24 = (eH % 12) + (endPeriod === "PM" ? 12 : 0);

    const [year, month, day] = dateStr.split("-").map(Number);
    const startObj = new Date(year, month - 1, day, sHour24, sM, 0);
    const endObj = new Date(year, month - 1, day, eHour24, eM, 0);

    return {
      start: startObj.getTime(),
      end: endObj.getTime(),
    };
  };

  const toggleAttendee = (userId: string) => {
    setAttendeeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCust = customers.find((c) => c.id === customerId);
    const { start, end } = getTimestamps();

    const eventPayload = {
      title,
      customerId,
      customerName: selectedCust?.name || "General / Internal",
      type,
      start,
      end: end <= start ? start + 3600000 : end,
      description,
      attendeeUserIds: attendeeIds.length > 0 ? attendeeIds : [currentUser.uid],
      reminderMinutes,
      reminded: false,
      syncStatus: "synced" as const,
    };

    if (isEditMode && initialData) {
      updateEvent(initialData.id, eventPayload);
    } else {
      addEvent(eventPayload);

      // Notify tagged employees (other than current user)
      const otherAttendees = attendeeIds.filter((id) => id !== currentUser.uid);
      if (otherAttendees.length > 0) {
        otherAttendees.forEach((recipientId) => {
          sendNotification({
            recipientUserId: recipientId,
            senderUserId: currentUser.uid,
            senderName: currentUser.displayName,
            type: "mention",
            title: `Added to Meeting: ${title}`,
            messageSnippet: `${currentUser.displayName} scheduled ${title} with you for ${dateStr} at ${startHour}:${startMinute} ${startPeriod}.`,
            targetUrl: "/calendar",
          });
        });
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (initialData) {
      deleteEvent(initialData.id);
      onClose();
    }
  };

  // Google Calendar URL Generator
  const handleOpenGoogleCalendar = () => {
    const { start, end } = getTimestamps();
    const selectedCust = customers.find((c) => c.id === customerId);

    // Resolve attendee emails
    const attendeeEmails = attendeeIds
      .map((id) => teamMembers.find((m) => m.uid === id)?.email)
      .filter(Boolean) as string[];

    if (selectedCust?.contacts[0]?.email) {
      attendeeEmails.push(selectedCust.contacts[0].email);
    }

    const gcalUrl = generateGoogleCalendarUrl({
      title: title || "Staxify Scheduled Event",
      description: `${description || ""}\n\nLinked Customer: ${
        selectedCust?.name || "None"
      }\nScheduled via StaxHQ CRM`,
      location: selectedCust?.address
        ? `${selectedCust.address.street || ""}, ${selectedCust.address.city || ""}, ${
            selectedCust.address.state || ""
          }`
        : "Staxify Corporate Operations",
      start,
      end: end <= start ? start + 3600000 : end,
      attendeeEmails,
    });

    window.open(gcalUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadIcs = () => {
    const { start, end } = getTimestamps();
    const selectedCust = customers.find((c) => c.id === customerId);

    downloadIcsFile({
      title: title || "Scheduled Event",
      description: description || `Client review for ${selectedCust?.name || "Staxify"}`,
      location: selectedCust?.name || "Staxify Operations",
      start,
      end: end <= start ? start + 3600000 : end,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              <span>{isEditMode ? "Edit Scheduled Event" : "Schedule Meeting or Block Time"}</span>
            </div>
            {isEditMode && (
              <Badge variant="outline" className="text-xs">
                Event ID: {initialData?.id.slice(-6)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Configure time blocks, assigned team members, automated alert reminders, and direct Google sync.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div>
            <Label htmlFor="evtTitle">Event / Meeting Title *</Label>
            <Input
              id="evtTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Town of Rehobeth - City Council Review"
              required
            />
          </div>

          {/* Customer & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="evtCust">Linked Customer / Account</Label>
              <select
                id="evtCust"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="">None (Internal Team Event)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="evtType">Event Category</Label>
              <select
                id="evtType"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="meeting">🤝 Client Meeting</option>
                <option value="demo">✨ Product Demo</option>
                <option value="block">⏱️ Focus / Deployment Block</option>
                <option value="milestone">🎯 Key Milestone</option>
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <Label htmlFor="evtDate">Date</Label>
            <Input
              id="evtDate"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              required
            />
          </div>

          {/* CUSTOM 15-MIN TIME PICKERS WITH CENTERED AM/PM & 1-HR AUTO ADVANCEMENT */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>Time Interval (15-Minute Blocks)</span>
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Auto-advances 1 hour
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Time Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <div className="flex items-center gap-1.5">
                  {/* Hour */}
                  <select
                    value={startHour}
                    onChange={(e) => handleStartTimeChange(e.target.value, startMinute, startPeriod)}
                    className="h-10 px-2.5 rounded-xl border border-input bg-card text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <span className="font-bold text-muted-foreground">:</span>

                  {/* Minute (15m increments) */}
                  <select
                    value={startMinute}
                    onChange={(e) => handleStartTimeChange(startHour, e.target.value, startPeriod)}
                    className="h-10 px-2.5 rounded-xl border border-input bg-card text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* Centered AM / PM Toggle */}
                  <div className="flex items-center p-1 rounded-xl bg-background border border-input ml-1">
                    <button
                      type="button"
                      onClick={() => handleStartTimeChange(startHour, startMinute, "AM")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        startPeriod === "AM"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartTimeChange(startHour, startMinute, "PM")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        startPeriod === "PM"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {/* End Time Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <div className="flex items-center gap-1.5">
                  {/* Hour */}
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="h-10 px-2.5 rounded-xl border border-input bg-card text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <span className="font-bold text-muted-foreground">:</span>

                  {/* Minute */}
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    className="h-10 px-2.5 rounded-xl border border-input bg-card text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {/* Centered AM / PM Toggle */}
                  <div className="flex items-center p-1 rounded-xl bg-background border border-input ml-1">
                    <button
                      type="button"
                      onClick={() => setEndPeriod("AM")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        endPeriod === "AM"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndPeriod("PM")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        endPeriod === "PM"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Team Members / Attendees */}
          <div className="space-y-2 pt-1">
            <Label className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-foreground">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Assign Team Members / Attendees</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Syncs to both calendars & sends alert
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => {
                const isSelected = attendeeIds.includes(member.uid);
                return (
                  <button
                    key={member.uid}
                    type="button"
                    onClick={() => toggleAttendee(member.uid)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-card text-muted-foreground border-border/80 hover:border-indigo-500/50 hover:text-foreground"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                    <span>{member.displayName}</span>
                    <span className="text-[10px] opacity-75">({member.role})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminder Alert Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <Label htmlFor="evtReminder" className="flex items-center gap-1.5 text-xs">
                <Bell className="h-3.5 w-3.5 text-amber-500" />
                <span>Automated Alert Reminder</span>
              </Label>
              <select
                id="evtReminder"
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value={0}>No Reminder</option>
                <option value={15}>15 Minutes Before (Chime & Push)</option>
                <option value={30}>30 Minutes Before (Chime & Push)</option>
                <option value={60}>1 Hour Before (Chime & Push)</option>
                <option value={120}>2 Hours Before (Chime & Push)</option>
                <option value={1440}>1 Day Before</option>
              </select>
            </div>

            {/* Direct Google Calendar Link Button */}
            <div className="flex flex-col justify-end">
              <Button
                type="button"
                onClick={handleOpenGoogleCalendar}
                variant="outline"
                className="h-10 gap-2 border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Add to Google Calendar</span>
              </Button>
            </div>
          </div>

          {/* Agenda / Notes */}
          <div>
            <Label htmlFor="evtDesc">Agenda / Notes</Label>
            <textarea
              id="evtDesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting objectives, dial-in link, or deployment checklist..."
              className="w-full bg-muted/40 border border-input rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-between sm:justify-between">
            <div>
              {isEditMode && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleDownloadIcs}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                title="Download .ics for Outlook or Apple Calendar"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export .ics</span>
              </Button>

              <Button type="button" variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>

              <Button type="submit" variant="gradient" size="sm">
                {isEditMode ? "Save Changes" : "Save to Calendar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
