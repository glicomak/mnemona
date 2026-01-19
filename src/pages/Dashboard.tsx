import { useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import ScheduleItem from "../components/ScheduleItem";

import { Calendar } from "lucide-react";

function Dashboard() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const dateRef = useRef<HTMLInputElement>(null);

  const weekMonday = useMemo(
    () => getMonday(selectedDate),
    [selectedDate]
  );

  const weekRangeLabel = useMemo(
    () => formatWeekRange(weekMonday),
    [weekMonday]
  );

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  }

  function formatWeekRange(monday: Date): string {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return `${formatShort(monday)} - ${formatShort(sunday)}`;
  }

  function formatShort(date: Date): string {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: 'numeric'
    });
  }

  useEffect(() => {
    invoke<ScheduleItem[]>("get_schedule", {
      date: formatDate(weekMonday),
    }).then((data) => {
      const sortedData = [...data].sort((a, b) => {
        const deptCompare = a.course.department.localeCompare(b.course.department);
        
        if (deptCompare === 0) {
          return a.course.serial - b.course.serial;
        }
        
        return deptCompare;
      });

      setSchedule(sortedData);
    });
  }, [weekMonday]);

  useEffect(() => {
    function onClickOutside() {
      dateRef.current?.blur();
    }

    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between my-4">
        <h1 className="text-xl">Dashboard</h1>

        <div className="flex items-center gap-3 bg-[#f0f2f5] px-4 py-2 rounded-xl">
          <span className="text-sm text-black/60">{weekRangeLabel}</span>

          <button
            type="button"
            onClick={() => {
              setOpen(true);
              requestAnimationFrame(() => dateRef.current?.click());
            }}
            className="p-1 rounded-md hover:bg-black/10 transition"
          >
            
            <Calendar className="h-4 w-4 text-black/60" />
          </button>

          <input
            ref={dateRef}
            type="date"
            value={formatDate(selectedDate)}
            onChange={(e) => {
              setSelectedDate(new Date(e.target.value));
              setOpen(false);
            }}
            className={open ? "absolute opacity-0" : "hidden"}
          />
        </div>
      </div>

      {schedule.length > 0 ? (
        schedule.map(item => (
          <ScheduleItem
            key={item.course.id}
            scheduleItem={item}
          />
        ))
      ) : (
        <p className="my-4">Nothing scheduled this week!</p>
      )}
    </div>
  );
}

export default Dashboard;
