
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export function ExamCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<{date: Date; title: string}[]>([]);

  const addEvent = () => {
    if (date) {
      setEvents([...events, { date, title: "New Exam" }]);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <Button onClick={addEvent}>Add Exam</Button>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Scheduled Exams:</h3>
          <ul className="space-y-2">
            {events.map((event, i) => (
              <li key={i} className="flex justify-between items-center">
                <span>{event.title}</span>
                <span className="text-gray-500">{format(event.date, 'PP')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
