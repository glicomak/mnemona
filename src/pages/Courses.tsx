import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import CourseBox from "../components/CourseBox";

function Courses() {
  type SortKey = "code" | "name" | "status";

  type SortRule = {
    key: SortKey;
    reverse: boolean;
  };

  const [courses, setCourses] = useState<CoursePreview[]>([]);
  const [sortRule, setSortRule] = useState<SortRule>({
    key: "status",
    reverse: false,
  });

  useEffect(() => {
    invoke<CoursePreview[]>("get_courses").then(setCourses);
  }, []);

  const statusOrder: Record<CoursePreview["status"], number> = {
    active: 0,
    inactive: 1,
    draft: 2,
    complete: 3,
  };

  function compareCourses(
    a: CoursePreview,
    b: CoursePreview,
    rule: SortRule
  ): number {
    let result = 0;

    switch (rule.key) {
      case "code": {
        const aCode = `${a.department}-${a.serial}`;
        const bCode = `${b.department}-${b.serial}`;
        result = aCode.localeCompare(bCode);
        break;
      }

      case "name":
        result = a.name.localeCompare(b.name);
        break;

      case "status":
        result = statusOrder[a.status] - statusOrder[b.status];
        break;
    }

    return rule.reverse ? -result : result;
  }

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => compareCourses(a, b, sortRule));
  }, [courses, sortRule]);

  function onHeaderClick(key: SortKey) {
    setSortRule(prev =>
      prev.key === key
        ? { key, reverse: !prev.reverse }
        : { key, reverse: false }
    );
  }

  const statusColorMap = new Map();
  statusColorMap.set("draft", "#545454");
  statusColorMap.set("inactive", "#eb0e3a");
  statusColorMap.set("active", "#1585e8");
  statusColorMap.set("complete", "#09b04c");

  useEffect(() => {
    invoke<CoursePreview[]>("get_courses").then((data) => setCourses(data));
  }, []);

  return (
    <div>
      <h1 className="text-xl my-4">Courses</h1>
      {courses.length == 0 ? (
        <p className="my-4">Generate courses to get started.</p>
      ) : (
        <>
          <div className="grid grid-cols-[15%_1fr_10%_15%] px-6 py-3 text-sm font-medium text-neutral-600">
            <span
              className="cursor-pointer select-none"
              onClick={() => onHeaderClick("code")}
            >
              Code
            </span>
            <span
              className="cursor-pointer select-none"
              onClick={() => onHeaderClick("name")}
            >
              Course
            </span>
            <span
              className="cursor-pointer select-none"
              onClick={() => onHeaderClick("status")}
            >
              Status
            </span>
            <span
              className="cursor-pointer select-none"
            >
              Progress
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {sortedCourses.map(course => (
              <CourseBox key={course.id} course={course} statusColorMap={statusColorMap} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Courses;
