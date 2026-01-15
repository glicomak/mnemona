use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::Type;

#[derive(Debug, Deserialize, Serialize)]
pub struct DepartmentDraft {
    pub code: String,
    pub name: String
}

#[derive(Debug, Serialize)]
pub struct Department {
    pub id: String,
    pub code: String,
    pub name: String
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TargetDraft {
    pub serial: i64,
    pub text: String,
    pub source: String
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Target {
    pub id: String,
    pub serial: i64,
    pub text: String,
    pub source: String,
    pub is_complete: bool
}

#[derive(Debug, Deserialize, Serialize)]
pub struct WeekDraft {
    pub serial: i64,
    pub text: String,
    pub targets: Vec<TargetDraft>
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Week {
    pub id: String,
    pub serial: i64,
    pub text: String,
    pub date: Option<DateTime<Utc>>,
    pub is_complete: bool,
    pub targets: Vec<Target>
}

#[derive(Debug, Clone, Serialize, Type)]
#[sqlx(type_name = "TEXT")]
#[sqlx(rename_all = "lowercase")]
pub enum CourseStatus {
    Draft,
    Inactive,
    Active,
    Complete
}

#[derive(Debug, Deserialize)]
pub struct CourseDraft {
    pub department: String,
    pub name: String,
    pub description: Option<String>,
    pub book: Option<String>,
    pub prompt: Option<String>
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CourseContentDraft {
    pub name: String,
    pub description: Option<String>,
    pub book: Option<String>,
    pub prompt: Option<String>,
    pub weeks: Vec<WeekDraft>
}

#[derive(Debug, Serialize)]
pub struct Course {
    pub id: String,
    pub department: Department,
    pub serial: i64,
    pub name: String,
    pub description: Option<String>,
    pub book: Option<String>,
    pub prompt: Option<String>,
    pub status: CourseStatus,
    pub weeks: Vec<Week>
}

#[derive(Debug, Serialize)]
pub struct CoursePreview {
    pub id: String,
    pub department: Department,
    pub serial: i64,
    pub name: String
}
