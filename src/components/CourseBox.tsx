import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseBox({ course, statusColorMap }: { course: any, statusColorMap: Map<string, string> }) {
  const navigate = useNavigate();
  const color = statusColorMap.get(course.status) ?? "#999999";

  const blobs = useMemo(() => {
    return Array.from({ length: 6 }).map((_) => ({
      width: Math.floor(Math.random() * 100) + 100,
      top: Math.floor(Math.random() * 100) - 20,
      left: Math.floor(Math.random() * 100) - 20,
      duration: Math.floor(Math.random() * 10) + 15,
      delay: Math.floor(Math.random() * 10) * -1
    }));
  }, []);

  return (
    <div onClick={() => navigate(`/courses/${course.id}`)} className="course-card-container">
      {course.status !== "draft" && (
        <div className="blobs-wrapper">
          {blobs.map((style, index) => (
            <div
              key={index}
              className={`blob blob-anim-${(index % 3) + 1}`}
              style={{
                backgroundColor: color,
                width: `${style.width}px`,
                height: `${style.width}px`,
                top: `${style.top}%`,
                left: `${style.left}%`,
                animationDuration: `${style.duration}s`,
                animationDelay: `${style.delay}s`,
              }}
            />
          ))}
          <div className="grain-overlay" />
        </div>
      )}

      <div className="relative z-10 grid grid-cols-[15%_1fr_10%] items-center w-full">
        <span className="text-sm font-medium">{course.department}-{course.serial}</span>
        <span>{course.name}</span>
        <span className="text-sm font-medium capitalize" style={{ color }}>{course.status}</span>
      </div>
    </div>
  );
}
