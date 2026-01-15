use sqlx::SqlitePool;
use tauri::State;

use crate::db::DatabaseState;

#[tauri::command]
pub async fn change_target_status(
    state: State<'_, DatabaseState>,
    target_id: String,
    status: bool,
) -> Result<(), String> {
    let pool: &SqlitePool = &state.0;

    sqlx::query(
        r#"
        UPDATE targets
        SET is_complete = ?
        WHERE id = ?
        "#
    )
    .bind(status)
    .bind(target_id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
