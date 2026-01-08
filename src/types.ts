type Department = {
  id: string,
  code: string,
  name: string
}

type Targets = {
  id: string,
  serial: number,
  text: string
}

type Week = {
  id: string,
  serial: number,
  text: string,
  targets: Targets[]
}

type Course = {
  id: string,
  department: Department,
  serial: number,
  name: string,
  description: string,
  book: string,
  weeks: Week[]
}

type CoursePreview = {
  id: string,
  department: Department,
  serial: number,
  name: string
}

type Module = {
  course: CoursePreview,
  weeks: Week[]
}
