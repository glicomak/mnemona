import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

import { GoogleGenAI } from "@google/genai";

function Generate() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState<string>('');
  const [departments, setDepartments] = useState<DepartmentDraft[]>([]);
  const [courses, setCourses] = useState<CourseDraft[]>([]);

  const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_KEY});

  useEffect(() => {
    invoke<DepartmentDraft[]>("get_departments").then((data) => setDepartments(data));
  }, []);

  async function enhance() {
    try {
      const fullPrompt = `
You are an AI university course generator.
Your task is to given a list of courses, make adjustements to it as per the user's prompt.
You might be given an empty list, in which case you are expected to generate the list from scratch.
The prompt field is a string that will be passed on to you in the future for generating individual course content.
Description should be short whereas prompt should be detailed.
Book must preferably have a specific edition number listed.
Ensure that there is no overlap in content between different courses.

CourseDraft: {
  department: text,
  name: text,
  description: text,
  book: text,
  prompt: text
}

Each course must have an associated department.
The department field holds the department code.
If a course belongs to a pre-existing department, tag it with its code.
Course names should not contain a department code or any kind of serial number.
Otherwise, generate a new department, in the form of DepartmentDraft.
You must finally return all departments as output, existing and new.

DepartmentDraft: {
  code: text,
  name: text
}

Output must only consist of JSON and nothing else.

Response: {
  departments: DepartmentDraft[]
  courses: CourseDraft[]
}

Prompt:
${prompt}

Departments:
${JSON.stringify(departments, null, 4)}

Courses:
${JSON.stringify(courses, null, 4)}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }]
          }
        ]
      });
      const text = response.text!;
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed: {
        departments: DepartmentDraft[],
        courses: CourseDraft[]
      } = JSON.parse(cleaned);

      setPrompt("");
      setDepartments(parsed.departments);
      setCourses(parsed.courses);
    } catch (err) {
      console.error("Enhance failed:", err);
    }
  }

  async function save() {
    invoke("create_courses", { courses, departments })
      .then(() => navigate("/courses"));
  }

  return (
    <div>
      <h1 className="text-xl my-4">Generate</h1>
      <textarea
        className="bg-[#f4f5f6] w-full h-50 p-4 rounded-xl outline-none"
        placeholder="Enter your prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={enhance} className="button-secondary mr-2">Prompt</button>
      <button onClick={save} className="button-primary">Save</button>
      {courses.map((course, index) => (
        <div key={index} className="bg-[#f0f2f5] w-full p-6 mb-4 rounded-xl">
          <p className="text-sm font-medium">{course.department}</p>
          <p className="text-lg mt-1">{course.name}</p>
          <p className="mt-1">{course.description}</p>
          <p className="mt-1">{course.book}</p>
          <p className="text-sm mt-1">{course.prompt}</p>
        </div>
      ))}
    </div>
  );
}

export default Generate;
