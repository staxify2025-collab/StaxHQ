"use client";

import React, { useState } from "react";
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
import { CalendarEvent, EventType } from "@/types/crm";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Calendar, Clock, Building2 } from "lucide-react";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export function EventModal({ isOpen, onClose, initialDate }: EventModalProps) {
  const { customers, addEvent, teamMembers, currentUser } = useTenant();

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [type, setType] = useState<EventType>("meeting");
  const [dateStr, setDateStr] = useState(
    initialDate
      ? initialDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCust = customers.find((c) => c.id === customerId);

    const startTimestamp = new Date(`${dateStr}T${startTime}`).getTime();
    const endTimestamp = new Date(`${dateStr}T${endTime}`).getTime();

    addEvent({
      title,
      customerId,
      customerName: selectedCust?.name || "General Event",
      type,
      start: isNaN(startTimestamp) ? Date.now() : startTimestamp,
      end: isNaN(endTimestamp) ? Date.now() + 3600000 : endTimestamp,
      description,
      attendeeUserIds: [currentUser.uid],
      syncStatus: "synced",
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span>Schedule Meeting or Block Time</span>
          </DialogTitle>
          <DialogDescription>
            Place events on the CRM schedule board and sync with Google Calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="evtCust">Linked Customer</Label>
              <select
                id="evtCust"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None (Internal)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="evtType">Event Type</Label>
              <select
                id="evtType"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="meeting">🤝 Client Meeting</option>
                <option value="demo">✨ Product Demo</option>
                <option value="block">⏱️ Focus / Deployment Block</option>
                <option value="milestone">🎯 Key Milestone</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
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
            <div>
              <Label htmlFor="evtStart">Start Time</Label>
              <Input
                id="evtStart"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="evtEnd">End Time</Label>
              <Input
                id="evtEnd"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

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

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save to Calendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
