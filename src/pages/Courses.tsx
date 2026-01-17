import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CoursePreview[]>([]);

  const statusColorMap = new Map();
  statusColorMap.set("draft", "#545454");
  statusColorMap.set("inactive", "#bd3533");
  statusColorMap.set("active", "#2583a8");
  statusColorMap.set("complete", "#13a838");

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
          <div className="grid grid-cols-[15%_1fr_10%] px-6 py-3 text-sm font-medium text-neutral-600">
            <span>Code</span>
            <span>Course</span>
            <span>Status</span>
          </div>

          <div className="space-y-2 mb-4">
            {courses.map(course => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="
                  grid grid-cols-[15%_1fr_10%]
                  items-center
                  px-6 py-4
                  bg-[#f0f2f5]
                  rounded-xl
                  cursor-pointer
                  hover:bg-[#e4e7ec]
                  transition
                "
              >
                <span className="text-sm font-medium">{course.department}-{course.serial}</span>
                <span>{course.name}</span>
                <span className="text-sm font-medium capitalize" style={{ color: statusColorMap.get(course.status) }}>{course.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Courses;
