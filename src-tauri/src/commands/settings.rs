use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Default)]
struct Settings {
    #[serde(default)]
    llm_token: Option<String>,
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;

    Ok(app_data_dir.join("settings.json"))
}

fn load_settings(path: &Path) -> Result<Settings, String> {
    if !path.exists() {
        return Ok(Settings::default());
    }

    let contents = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let settings: Settings = serde_json::from_str(&contents).map_err(|e| e.to_string())?;
    Ok(settings)
}

fn save_settings(path: &Path, settings: &Settings) -> Result<(), String> {
    let contents =
        serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    fs::write(path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_llm_token(
    app: AppHandle,
    token: String,
) -> Result<(), String> {
    let path = settings_path(&app)?;
    let mut settings = load_settings(&path)?;
    settings.llm_token = Some(token);
    save_settings(&path, &settings)
}

#[tauri::command]
pub async fn get_llm_token(
    app: AppHandle,
) -> Result<Option<String>, String> {
    let path = settings_path(&app)?;
    let settings = load_settings(&path)?;
    Ok(settings.llm_token)
}

