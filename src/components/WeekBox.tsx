import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import TargetBox from "./TargetBox";

function WeekBox({ week, courseStatus }: { week: Week, courseStatus: string }) {
  const [isComplete, setIsComplete] = useState(week.isComplete);

  useEffect(() => {
    if (courseStatus === "draft") {
      setIsComplete(false);
    } else if (courseStatus === "complete") {
      setIsComplete(true);
    } else {
      setIsComplete(week.isComplete);
    }
  }, [courseStatus]);

  const formatWeekRange = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };

    const startFormatted = start.toLocaleDateString('en-US', options);
    const endFormatted = end.toLocaleDateString('en-US', options);

    return `${startFormatted} - ${endFormatted}`;
  };

  function toggleStatus() {
    if (courseStatus === "active") {
      invoke("change_week_status", { weekId: week.id, status: !isComplete }).then(() => setIsComplete(!isComplete));
    }
  }

  return (
    <div className="bg-[#e0e4ea] p-4 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className={isComplete ? "text-[#676767]" : ""}>
          <p className="text-sm font-medium">WEEK-{week.serial}</p>
          <p className="text-lg mt-1">{week.text}</p>
        </div>

        <div className="flex flex-col items-end text-right">
          {courseStatus !== "draft" && (
            <button
              className={`px-3 py-1 text-sm rounded-full transition
                ${courseStatus === "active" ? "cursor-pointer" : ""}
                ${
                  isComplete
                    ? "bg-[#42b773]/20 text-[#2f7d55]"
                    : "bg-black/10 text-neutral-700"
                }
                ${(courseStatus === "active" && !isComplete) ? "hover:bg-black/20" : ""}
              `}
              onClick={toggleStatus}
            >
              {isComplete ? "Complete" : "Incomplete"}
            </button>
          )}
          {((courseStatus == "inactive" && week.isComplete) || courseStatus == "active" || courseStatus === "complete") && (
            <p className="text-sm text-neutral-700 mt-2 mr-2 font-medium">
              {week.date && formatWeekRange(week.date)}
            </p>
          )}
        </div>
      </div>

      {week.targets.map((target) => <TargetBox key={target.id} target={target} courseStatus={courseStatus} />)}
    </div>
  );
}

export default WeekBox;
