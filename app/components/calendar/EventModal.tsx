"use client";

interface CalendarEvent {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-[400px] rounded bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">{event.title}</h2>

        <p>{event.description}</p>

        <p className="mt-3">
          시작 : {event.startDate} {event.startTime}
        </p>

        <p>
          종료 : {event.endDate} {event.endTime}
        </p>

        <button onClick={onClose} className="mt-5 rounded border px-4 py-2">
          닫기
        </button>
      </div>
    </div>
  );
}
