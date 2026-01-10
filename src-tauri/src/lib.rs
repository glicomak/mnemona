pub mod commands;
pub mod db;
pub mod types;

use tauri::Manager;

use crate::commands::courses::{create_courses, get_courses};
use crate::commands::departments::get_departments;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                let database = db::Database::new(&handle)
                    .await
                    .expect("failed to initialize database");

                handle.manage(db::DatabaseState(database.pool));
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_courses,
            get_courses,
            get_departments
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
