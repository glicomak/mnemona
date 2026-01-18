use chrono::{Datelike, NaiveDate};
use sqlx::{SqlitePool, Row};
use std::collections::HashMap;
use tauri::State;
use uuid::Uuid;

use crate::db::DatabaseState;
use crate::types::{Course, CourseContentDraft, CourseDraft, CoursePreview, Department, DepartmentDraft, Target, Week};

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
pub async fn get_course(
    state: State<'_, DatabaseState>,
    course_id: String,
) -> Result<Course, String> {
    let pool: &SqlitePool = &state.0;

    let row = sqlx::query(
        r#"
        SELECT
          c.id            AS course_id,
          c.serial        AS course_serial,
          c.name          AS course_name,
          c.description   AS course_description,
          c.book          AS course_book,
          c.prompt        AS course_prompt,
          c.status        AS course_status,
          d.id            AS dept_id,
          d.code          AS dept_code,
          d.name          AS dept_name
        FROM courses c
        JOIN departments d ON c.department_id = d.id
        WHERE c.id = ?
        "#
    )
    .bind(&course_id)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut course = Course {
        id: row.get("course_id"),
        department: Department {
            id: row.get("dept_id"),
            code: row.get("dept_code"),
            name: row.get("dept_name")
        },
        serial: row.get::<i64, _>("course_serial"),
        name: row.get("course_name"),
        description: row.get("course_description"),
        book: row.get("course_book"),
        prompt: row.get("course_prompt"),
        status: row.get("course_status"),
        weeks: Vec::new()
    };

    let week_rows = sqlx::query(
        r#"
        SELECT id, serial, text, date, is_complete
        FROM weeks
        WHERE course_id = ?
        ORDER BY serial
        "#
    )
    .bind(&course_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    use std::collections::HashMap;
    let mut week_map: HashMap<String, Week> = HashMap::new();
    let mut week_ids = Vec::new();

    for row in week_rows {
        let id: String = row.get("id");
        week_ids.push(id.clone());

        week_map.insert(
            id.clone(),
            Week {
                id,
                serial: row.get::<i64, _>("serial"),
                text: row.get("text"),
                date: row.get::<Option<NaiveDate>, _>("date"),
                is_complete: row.get("is_complete"),
                targets: Vec::new()
            }
        );
    }

    if !week_ids.is_empty() {
        let placeholders = week_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");

        let query = format!(
            r#"
            SELECT id, week_id, serial, text, source, is_complete
            FROM targets
            WHERE week_id IN ({})
            ORDER BY serial
            "#,
            placeholders
        );

        let mut q = sqlx::query(&query);
        for id in &week_ids {
            q = q.bind(id);
        }

        let target_rows = q
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

        for row in target_rows {
            let week_id: String = row.get("week_id");

            if let Some(week) = week_map.get_mut(&week_id) {
                week.targets.push(Target {
                    id: row.get("id"),
                    serial: row.get::<i64, _>("serial"),
                    text: row.get("text"),
                    source: row.get("source"),
                    is_complete: row.get("is_complete")
                });
            }
        }
    }

    let mut weeks: Vec<Week> = week_map.into_values().collect();
    weeks.sort_by_key(|w| w.serial);

    course.weeks = weeks;

    Ok(course)
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
          c.status      AS course_status,
          d.code        AS dept_code
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
            department: row.get("dept_code"),
            serial: row.get::<i64, _>("course_serial"),
            name: row.get("course_name"),
            status: row.get("course_status")
        }
    }).collect();

    Ok(courses)
}

#[tauri::command]
pub async fn update_course(
    state: State<'_, DatabaseState>,
    course_id: String,
    draft: CourseContentDraft,
) -> Result<(), String> {
    let pool: &SqlitePool = &state.0;
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        r#"
        UPDATE courses
        SET name = ?, description = ?, book = ?
        WHERE id = ?
        "#
    )
    .bind(&draft.name)
    .bind(&draft.description)
    .bind(&draft.book)
    .bind(&course_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    let existing_week_ids: Vec<String> = sqlx::query_scalar(
        r#"
        SELECT id FROM weeks WHERE course_id = ?
        "#
    )
    .bind(&course_id)
    .fetch_all(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    if !existing_week_ids.is_empty() {
        let placeholders = existing_week_ids
            .iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(",");

        let delete_targets = format!(
            "DELETE FROM targets WHERE week_id IN ({})",
            placeholders
        );

        let mut q = sqlx::query(&delete_targets);
        for id in &existing_week_ids {
            q = q.bind(id);
        }

        q.execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }

    sqlx::query("DELETE FROM weeks WHERE course_id = ?")
        .bind(&course_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    for week in draft.weeks {
        let week_id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO weeks (id, course_id, serial, text)
            VALUES (?, ?, ?, ?)
            "#
        )
        .bind(&week_id)
        .bind(&course_id)
        .bind(week.serial)
        .bind(&week.text)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        for target in week.targets {
            sqlx::query(
                r#"
                INSERT INTO targets (id, week_id, serial, text, source)
                VALUES (?, ?, ?, ?, ?)
                "#
            )
            .bind(uuid::Uuid::new_v4().to_string())
            .bind(&week_id)
            .bind(target.serial)
            .bind(&target.text)
            .bind(&target.source)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_course_status(
    state: State<'_, DatabaseState>,
    course_id: String,
    status: String,
) -> Result<(), String> {
    use chrono::{Duration, Utc, Weekday};
    use sqlx::SqlitePool;

    let pool: &SqlitePool = &state.0;

    match status.as_str() {
        "draft" | "inactive" | "complete" => {
            sqlx::query(
                r#"
                UPDATE courses
                SET status = ?
                WHERE id = ?
                "#,
            )
            .bind(&status)
            .bind(&course_id)
            .execute(pool)
            .await
            .map_err(|e| e.to_string())?;

            Ok(())
        }

        "active" => {
            sqlx::query(
                r#"
                UPDATE courses
                SET status = ?
                WHERE id = ?
                "#,
            )
            .bind(&status)
            .bind(&course_id)
            .execute(pool)
            .await
            .map_err(|e| e.to_string())?;

            let weeks: Vec<String> = sqlx::query_scalar(
                r#"
                SELECT id
                FROM weeks
                WHERE course_id = ?
                AND is_complete = false
                ORDER BY serial ASC
                "#,
            )
            .bind(&course_id)
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            let mut date = Utc::now().date_naive();
            while date.weekday() != Weekday::Mon {
                date -= Duration::days(1);
            }

            for (i, week_id) in weeks.iter().enumerate() {
                let week_date = date + Duration::weeks(i as i64);

                sqlx::query(
                    r#"
                    UPDATE weeks
                    SET date = ?
                    WHERE id = ?
                    "#,
                )
                .bind(week_date)
                .bind(week_id)
                .execute(pool)
                .await
                .map_err(|e| e.to_string())?;
            }

            Ok(())
        }

        _ => Err("invalid status".to_string()),
    }
}
