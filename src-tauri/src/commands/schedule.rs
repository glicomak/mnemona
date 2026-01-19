use chrono::NaiveDate;
use sqlx::{Row, SqlitePool};
use tauri::State;

use crate::{db::DatabaseState, types::{CourseHeader, ScheduleItem, Target, Week}};

#[tauri::command]
pub async fn get_schedule(
    state: State<'_, DatabaseState>,
    date: NaiveDate,
) -> Result<Vec<ScheduleItem>, String> {
    let pool: &SqlitePool = &state.0;

    let week_rows = sqlx::query(
        r#"
        SELECT
          w.id            AS week_id,
          w.serial        AS week_serial,
          w.text          AS week_text,
          w.date          AS week_date,
          w.is_complete   AS week_complete,

          c.id            AS course_id,
          c.serial        AS course_serial,
          c.name          AS course_name,
          c.status        AS course_status,

          d.code          AS dept_code
        FROM weeks w
        JOIN courses c ON w.course_id = c.id
        JOIN departments d ON c.department_id = d.id
        WHERE w.date = ?
          AND (
            c.status IN ('active', 'complete')
            OR (c.status = 'inactive' AND w.is_complete = true)
          )
        ORDER BY d.code, c.serial, w.serial
        "#
    )
    .bind(date)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    let week_ids: Vec<String> = week_rows
        .iter()
        .map(|r| r.get::<String, _>("week_id"))
        .collect();

    let target_rows = sqlx::query(
        r#"
        SELECT
          t.id,
          t.week_id,
          t.serial,
          t.text,
          t.source,
          t.is_complete
        FROM targets t
        WHERE t.week_id IN (
          SELECT value FROM json_each(?)
        )
        ORDER BY t.week_id, t.serial
        "#
    )
    .bind(serde_json::to_string(&week_ids).unwrap())
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    use std::collections::HashMap;

    let mut targets_by_week: HashMap<String, Vec<Target>> = HashMap::new();

    for row in target_rows {
        let week_id: String = row.get("week_id");

        targets_by_week
            .entry(week_id)
            .or_default()
            .push(Target {
                id: row.get("id"),
                serial: row.get("serial"),
                text: row.get("text"),
                source: row.get("source"),
                is_complete: row.get("is_complete"),
            });
    }

    let mut schedule_map: HashMap<String, ScheduleItem> = HashMap::new();

    for row in week_rows {
        let course_id: String = row.get("course_id");
        let week_id: String = row.get("week_id");

        let week = Week {
            id: week_id.clone(),
            serial: row.get("week_serial"),
            text: row.get("week_text"),
            date: row.get::<Option<NaiveDate>, _>("week_date"),
            is_complete: row.get("week_complete"),
            targets: targets_by_week.remove(&week_id).unwrap_or_default(),
        };

        schedule_map
            .entry(course_id.clone())
            .or_insert_with(|| ScheduleItem {
                course: CourseHeader {
                    id: course_id.clone(),
                    department: row.get("dept_code"),
                    serial: row.get("course_serial"),
                    name: row.get("course_name"),
                    status: row.get("course_status"),
                },
                weeks: Vec::new(),
            })
            .weeks
            .push(week);
    }

    Ok(schedule_map.into_values().collect())
}
