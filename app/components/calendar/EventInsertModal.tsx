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
  newEvent: CalendarEvent;
  setNewEvent: React.Dispatch<React.SetStateAction<CalendarEvent>>;

  onInsert: () => void;
  onClose: () => void;
}

export default function EventInsertModal({
  newEvent,
  setNewEvent,
  onInsert,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-[500px] rounded bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">일정 추가</h2>

        <div className="flex flex-col gap-3">
          <input
            placeholder="제목"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                title: e.target.value,
              })
            }
            className="border p-2"
          />

          <textarea
            placeholder="설명"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                description: e.target.value,
              })
            }
            className="border p-2"
          />

          <input
            type="date"
            value={newEvent.startDate}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                startDate: e.target.value,
              })
            }
            className="border p-2"
          />

          <input
            type="date"
            value={newEvent.endDate}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                endDate: e.target.value,
              })
            }
            className="border p-2"
          />

          <input
            type="time"
            value={newEvent.startTime}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                startTime: e.target.value,
              })
            }
            className="border p-2"
          />

          <input
            type="time"
            value={newEvent.endTime}
            onChange={(e) =>
              setNewEvent({
                ...newEvent,
                endTime: e.target.value,
              })
            }
            className="border p-2"
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onInsert}
            className="rounded bg-black px-4 py-2 text-white"
          >
            등록
          </button>

          <button onClick={onClose} className="rounded border px-4 py-2">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
