use serde::{Deserialize, Serialize};

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

#[derive(Debug, Deserialize)]
pub struct CourseDraft {
    pub department: String,
    pub name: String,
    pub description: Option<String>,
    pub book: Option<String>,
    pub prompt: Option<String>
}

#[derive(Debug, Serialize)]
pub struct CoursePreview {
    pub id: String,
    pub department: Department,
    pub serial: i64,
    pub name: String
}
