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

  const total = course.weeks.numTotal;
  const completed = course.weeks.numComplete;
  let progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  if (course.status === "complete") {
    progress = 100;
  }

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

      <div className="relative z-10 grid grid-cols-[15%_1fr_10%_10%] items-center w-full">
        <span className="text-sm font-medium">{course.department}-{course.serial}</span>
        <span>{course.name}</span>
        <span className="text-sm font-medium capitalize" style={{ color }}>{course.status}</span>
        {course.status !== "draft" && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            <span className="text-xs tabular-nums text-black/60 text-right whitespace-nowrap">
              {completed} | {total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
