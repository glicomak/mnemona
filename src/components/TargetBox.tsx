import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";


function TargetBox({ target }: { target: Target }) {
  const [isComplete, setIsComplete] = useState(target.isComplete);

  function toggleStatus() {
    invoke("change_target_status", { targetId: target.id, status: !isComplete }).then(() => setIsComplete(!isComplete));
  }

  return (
    <div className="flex items-start gap-3 mt-2">
      <input
        type="checkbox"
        checked={isComplete}
        onChange={toggleStatus}
        className="mt-1 h-4 w-4 accent-[#42b773]"
      />

      <div className={isComplete ? "text-[#676767]" : ""}>
        <p>{target.text}</p>
        <p className="text-sm">{target.source}</p>
      </div>
    </div>
  );
}

export default TargetBox;
