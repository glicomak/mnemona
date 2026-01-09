use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};
use tauri::{AppHandle, Manager};

pub struct Database {
    pub pool: SqlitePool
}

pub struct DatabaseState(pub SqlitePool);

impl Database {
    pub async fn new(handle: &AppHandle) -> Result<Self, sqlx::Error> {
        let app_data_dir = handle
            .path()
            .app_data_dir()
            .expect("failed to get app data dir");
        std::fs::create_dir_all(&app_data_dir)
            .expect("failed to create app data dir");

        let db_path = app_data_dir.join("mnemona.db");
        let options = SqliteConnectOptions::new()
            .filename(db_path)
            .create_if_missing(true);
        let pool = SqlitePool::connect_with(options).await?;

        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }
}
