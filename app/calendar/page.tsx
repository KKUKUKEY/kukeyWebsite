"use client";

import { useEffect, useState } from "react";

import CalendarView from "@/app/components/calendar/CalendarView";

import EventModal from "@/app/components/calendar/EventModal";

import EventInsertModal from "@/app/components/calendar/EventInsertModal";

interface CalendarEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const [showInsertModal, setShowInsertModal] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [newEvent, setNewEvent] = useState<CalendarEvent>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const loadCalendar = async () => {
    // TODO:
    // Routing 확인 필요
  };

  const handleInsert = async () => {
    // TODO:
    // API 연결
  };

  useEffect(() => {
    setIsAdmin(localStorage.getItem("role") === "admin");

    loadCalendar();
  }, []);

  return (
    <main className="p-8">
      <div className="mb-5 flex justify-between">
        <h1 className="text-3xl font-bold">동아리 일정</h1>

        {isAdmin && (
          <button
            onClick={() => setShowInsertModal(true)}
            className="rounded bg-black px-4 py-2 text-white"
          >
            일정 추가
          </button>
        )}
      </div>

      <CalendarView events={events} onEventClick={setSelectedEvent} />

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {showInsertModal && (
        <EventInsertModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onInsert={handleInsert}
          onClose={() => setShowInsertModal(false)}
        />
      )}
    </main>
  );
}
