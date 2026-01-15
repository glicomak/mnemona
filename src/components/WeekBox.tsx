import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import TargetBox from "./TargetBox";

function WeekBox({ week }: { week: Week }) {
  const [isComplete, setIsComplete] = useState(week.isComplete);

  function toggleStatus() {
    invoke("change_week_status", { weekId: week.id, status: !isComplete }).then(() => setIsComplete(!isComplete));
  }

  return (
    <div className="bg-[#e0e4ea] p-4 mb-4 rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <div className={isComplete ? "text-[#676767]" : ""}>
          <p className="text-sm font-medium">WEEK-{week.serial}</p>
          <p className="text-lg mt-1">{week.text}</p>
        </div>

        <button
          className={`px-3 py-1 text-sm rounded-full cursor-pointer transition
            ${
              isComplete
                ? "bg-[#42b773]/20 text-[#2f7d55]"
                : "bg-black/10 text-neutral-700 hover:bg-black/20"
            }`}
          onClick={toggleStatus}
        >
          {isComplete ? "Complete" : "Incomplete"}
        </button>
      </div>

      {week.targets.map((target) => <TargetBox key={target.id} target={target} />)}
    </div>
  );
}

export default WeekBox;
