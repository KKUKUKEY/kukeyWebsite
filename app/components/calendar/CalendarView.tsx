"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface CalendarEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface Props {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarView({ events, onEventClick }: Props) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="auto"
      events={events.map((event) => ({
        title: event.title,
        start: `${event.startDate}T${event.startTime}`,
        end: `${event.endDate}T${event.endTime}`,
        extendedProps: event,
      }))}
      eventClick={(info) => {
        onEventClick(info.event.extendedProps as CalendarEvent);
      }}
    />
  );
}
