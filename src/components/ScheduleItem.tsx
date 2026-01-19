import WeekBox from "./WeekBox";

function ScheduleItem({ scheduleItem } : { scheduleItem: ScheduleItem }) {
  const course = scheduleItem.course;
  const weeks = scheduleItem.weeks;

  return (
    <div className="bg-[#f0f2f5] w-full p-6 mb-4 rounded-xl">
      <p className="text-sm font-medium">{course.department}-{course.serial}</p>
      <p className="text-lg mt-1">{course.name}</p>
      {weeks.map((week) => (
        <div className="mt-4">
          <WeekBox week={week} courseStatus={course.status} />
        </div>
      ))}
    </div>
  );
}

export default ScheduleItem;
