import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CoursePreview[]>([]);

  useEffect(() => {
    invoke<CoursePreview[]>("get_courses").then((data) => setCourses(data));
  }, []);

  return (
    <div>
      <h1 className="text-xl my-4">Courses</h1>
      {courses.map(course => (
        <div key={course.id} className="bg-[#f0f2f5] w-full p-6 mb-4 rounded-xl" onClick={() => navigate(`/courses/${course.id}`)}>
          <p className="text-sm font-medium">{course.department.code}-{course.serial}</p>
          <p className="text-lg mt-1">{course.name}</p>
        </div>
      ))}
    </div>
  );
}

export default Courses;
