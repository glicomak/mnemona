function Module({ module } : { module: Module }) {
  const course = module.course;
  const weeks = module.weeks;

  return (
    <div className="bg-[#f0f2f5] w-full p-6 mb-4 rounded-xl">
      <p className="text-sm font-medium">{course.department.code}-{course.serial}</p>
      <p className="text-lg mt-1">{course.name}</p>
      {weeks.map((week) => (
        <div className="bg-[#e0e4ea] p-4 mt-4 rounded-xl">
          <p className="text-sm font-medium">WEEK-{week.serial}</p>
          <p className="text-lg mt-1">{week.text}</p>
          {week.targets.map((target) => (
            <p className="mt-1">{target.text}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Module;
