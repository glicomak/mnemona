CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY NOT NULL,
    department_id TEXT NOT NULL,
    serial INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    book TEXT,
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weeks (
    id TEXT PRIMARY KEY NOT NULL,
    course_id TEXT NOT NULL,
    serial INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY NOT NULL,
    week_id TEXT NOT NULL,
    serial INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (week_id) REFERENCES weeks (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_weeks_course ON weeks(course_id);
CREATE INDEX IF NOT EXISTS idx_targets_week ON targets(week_id);
