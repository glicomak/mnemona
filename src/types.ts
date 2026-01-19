type DepartmentDraft = {
  code: string,
  name: string
}

type Department = {
  id: string,
  code: string,
  name: string
}

type TargetDraft = {
  serial: number,
  text: string,
  source: string
}

type Target = {
  id: string,
  serial: number,
  text: string,
  source: string,
  isComplete: boolean
}

type WeekDraft = {
  serial: number,
  text: string,
  targets: TargetDraft[]
}

type Week = {
  id: string,
  serial: number,
  text: string,
  date: string | null,
  isComplete: boolean,
  targets: Target[]
}

type CourseDraft = {
  department: string,
  name: string,
  description: string,
  book: string,
  prompt: string
}

type CourseContentDraft = {
  name: string,
  description: string,
  book: string,
  weeks: WeekDraft[]
}

type Course = {
  id: string,
  department: Department,
  serial: number,
  name: string,
  description: string,
  book: string,
  prompt: string,
  status: string,
  weeks: Week[]
}

type CoursePreview = {
  id: string,
  department: string,
  serial: number,
  name: string,
  status: string
}

type ScheduleItem = {
  course: CoursePreview,
  weeks: Week[]
}
