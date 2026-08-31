"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Building2, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventModal } from "@/components/calendar/EventModal";
import { formatDate } from "@/lib/utils";
import { EventType } from "@/types/crm";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";

const eventTypeStyles: Record<EventType, { badge: string; bg: string }> = {
  meeting: {
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    bg: "bg-indigo-500/15 border-l-4 border-l-indigo-600 text-indigo-900 dark:text-indigo-100",
  },
  demo: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    bg: "bg-emerald-500/15 border-l-4 border-l-emerald-600 text-emerald-900 dark:text-emerald-100",
  },
  block: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    bg: "bg-amber-500/15 border-l-4 border-l-amber-600 text-amber-900 dark:text-amber-100",
  },
  milestone: {
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    bg: "bg-purple-500/15 border-l-4 border-l-purple-600 text-purple-900 dark:text-purple-100",
  },
};

export default function CalendarPage() {
  const { events, deleteEvent, customers } = useTenant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectedDayEvents = events.filter((evt) =>
    isSameDay(new Date(evt.start), selectedDate)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>Calendar & Schedule Board</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Block focus time, schedule client reviews, and sync with your Google Workspace calendar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Google Sync Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Google Workspace Synced</span>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="gradient"
            className="gap-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground min-w-[180px]">
            {format(currentDate, "MMMM yyyy")}
          </h2>

          <div className="flex items-center gap-1">
            <Button onClick={prevMonth} variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToToday} variant="outline" size="sm" className="h-8 text-xs px-3">
              Today
            </Button>
            <Button onClick={nextMonth} variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                viewMode === "month"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                viewMode === "agenda"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid or Agenda View */}
      {viewMode === "month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Month Grid */}
          <div className="lg:col-span-3 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60">
              {days.map((day, idx) => {
                const dayEvents = events.filter((e) =>
                  isSameDay(new Date(e.start), day)
                );
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[110px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                      !isCurrentMonth ? "bg-muted/10 opacity-40" : "bg-card"
                    } ${isSelected ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50/20" : "hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center ${
                          isCurrentDay
                            ? "bg-indigo-600 text-white font-bold"
                            : isSelected
                            ? "text-indigo-600 font-bold"
                            : "text-foreground"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-bold text-muted-foreground">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events Mini List */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                            eventTypeStyles[evt.type]?.bg || "bg-muted text-foreground"
                          }`}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-muted-foreground block pl-1">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Selected Day Detail */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border/80">
              <CardHeader className="p-4 pb-2 border-b border-border/60">
                <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>{format(selectedDate, "EEEE, MMM d")}</span>
                  {isToday(selectedDate) && (
                    <Badge variant="outline" className="text-[10px]">
                      TODAY
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No meetings or blocks scheduled for this day.
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="mt-3 text-xs w-full"
                    >
                      + Add Meeting
                    </Button>
                  </div>
                ) : (
                  selectedDayEvents.map((evt) => {
                    const customer = customers.find((c) => c.id === evt.customerId);
                    return (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-foreground leading-tight">
                            {evt.title}
                          </h4>
                          <button
                            onClick={() => deleteEvent(evt.id)}
                            className="text-muted-foreground hover:text-rose-600 p-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                          <Clock className="h-3 w-3 text-indigo-500" />
                          <span>
                            {format(new Date(evt.start), "h:mm a")} -{" "}
                            {format(new Date(evt.end), "h:mm a")}
                          </span>
                        </div>

                        {customer && (
                          <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                            <Building2 className="h-3 w-3" />
                            <Link href={`/customers/${customer.id}`} className="hover:underline">
                              {customer.name}
                            </Link>
                          </div>
                        )}

                        {evt.description && (
                          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground">Upcoming Schedule Agenda</h3>
          <div className="divide-y divide-border/60">
            {events.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No events on schedule.</p>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">{evt.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${
                            eventTypeStyles[evt.type]?.badge
                          }`}
                        >
                          {evt.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{formatDate(evt.start)}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(evt.start), "h:mm a")} - {format(new Date(evt.end), "h:mm a")}
                        </span>
                        {evt.customerName && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground">{evt.customerName}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => deleteEvent(evt.id)}
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 self-end sm:self-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
}
