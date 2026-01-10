use sqlx::{Row, SqlitePool};
use tauri::State;

use crate::db::DatabaseState;
use crate::types::DepartmentDraft;

#[tauri::command]
pub async fn get_departments(
    state: State<'_, DatabaseState>,
) -> Result<Vec<DepartmentDraft>, String> {
    let pool: &SqlitePool = &state.0;

    let rows = sqlx::query("SELECT code, name FROM departments ORDER BY code")
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    let departments = rows
        .into_iter()
        .map(|row| DepartmentDraft {
            code: row.get::<String, _>("code"),
            name: row.get::<String, _>("name")
        })
        .collect();

    Ok(departments)
}
