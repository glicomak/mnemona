use std::collections::HashMap;
use sqlx::{SqlitePool, Row};
use tauri::State;
use uuid::Uuid;

use crate::db::DatabaseState;
use crate::types::{CourseDraft, CoursePreview, Department, DepartmentDraft};

async fn generate_course_serial(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    department_id: &str,
) -> Result<i64, sqlx::Error> {
    let mut digits = 3;

    loop {
        let lower = 10_i64.pow(digits - 1);
        let upper = 10_i64.pow(digits) - 1;
        let range_size = upper - lower + 1;

        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM courses
             WHERE department_id = ? AND serial BETWEEN ? AND ?"
        )
        .bind(department_id)
        .bind(lower)
        .bind(upper)
        .fetch_one(&mut **tx)
        .await?;

        if count < range_size {
            for _ in 0..10 {
                let candidate =
                    lower + (rand::random::<u64>() % range_size as u64) as i64;

                let exists: Option<i64> = sqlx::query_scalar(
                    "SELECT 1 FROM courses
                     WHERE department_id = ? AND serial = ?"
                )
                .bind(department_id)
                .bind(candidate)
                .fetch_optional(&mut **tx)
                .await?;

                if exists.is_none() {
                    return Ok(candidate);
                }
            }
        }

        digits += 1;
    }
}

#[tauri::command]
pub async fn create_courses(
    state: State<'_, DatabaseState>,
    courses: Vec<CourseDraft>,
    departments: Vec<DepartmentDraft>,
) -> Result<(), String> {
    let pool: &SqlitePool = &state.0;

    let mut tx = pool
        .begin()
        .await
        .map_err(|e| e.to_string())?;

    for dept in departments {
        let existing = sqlx::query(
            "SELECT id FROM departments WHERE code = ?"
        )
        .bind(&dept.code)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        match existing {
            Some(row) => {
                let id: String = row.get("id");

                sqlx::query(
                    "UPDATE departments SET name = ? WHERE id = ?"
                )
                .bind(&dept.name)
                .bind(id)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
            }
            None => {
                let id = Uuid::new_v4().to_string();

                sqlx::query(
                    "INSERT INTO departments (id, code, name)
                     VALUES (?, ?, ?)"
                )
                .bind(id)
                .bind(&dept.code)
                .bind(&dept.name)
                .execute(&mut *tx)
                .await
                .map_err(|e| e.to_string())?;
            }
        }
    }

    let rows = sqlx::query(
        "SELECT id, code FROM departments"
    )
    .fetch_all(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    let mut dept_map: HashMap<String, String> = HashMap::new();

    for row in rows {
        let id: String = row.get("id");
        let code: String = row.get("code");
        dept_map.insert(code, id);
    }

    for course in courses {
        let department_id = dept_map
            .get(&course.department)
            .ok_or_else(|| format!("Unknown department code: {}", course.department))?
            .clone();

        let serial = generate_course_serial(&mut tx, &department_id)
            .await
            .map_err(|e| e.to_string())?;

        let id = Uuid::new_v4().to_string();

        sqlx::query(
            "INSERT INTO courses
            (id, department_id, serial, name, description, book, prompt)
            VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(id)
        .bind(department_id)
        .bind(serial)
        .bind(course.name)
        .bind(course.description)
        .bind(course.book)
        .bind(course.prompt)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    tx.commit()
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_courses(
    state: State<'_, DatabaseState>,
) -> Result<Vec<CoursePreview>, String> {
    let pool: &SqlitePool = &state.0;

    let rows = sqlx::query(
        r#"
        SELECT
          c.id          AS course_id,
          c.serial      AS course_serial,
          c.name        AS course_name,
          d.id          AS dept_id,
          d.code        AS dept_code,
          d.name        AS dept_name
        FROM courses c
        JOIN departments d ON c.department_id = d.id
        ORDER BY d.code, c.serial
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    let courses = rows.into_iter().map(|row| {
        CoursePreview {
            id: row.get("course_id"),
            serial: row.get::<i64, _>("course_serial"),
            name: row.get("course_name"),
            department: Department {
                id: row.get("dept_id"),
                code: row.get("dept_code"),
                name: row.get("dept_name"),
            },
        }
    }).collect();

    Ok(courses)
}
