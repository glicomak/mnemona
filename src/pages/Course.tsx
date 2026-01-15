import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

import { GoogleGenAI } from "@google/genai";

function Course() {
  const { id } = useParams();

  const [prompt, setPrompt] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);

  const courseContent = useMemo<CourseContentDraft | null>(() => {
    if (!course) return null;

    return {
      name: course.name,
      description: course.description,
      book: course.book,
      weeks: course.weeks.map((week) => ({
        serial: week.serial,
        text: week.text,
        targets: week.targets.map((target) => ({
          serial: target.serial,
          text: target.text,
          source: target.source
        }))
      }))
    };
  }, [course]);

  const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_KEY});

  useEffect(() => {
    invoke<Course>("get_course", { courseId: id }).then((data) => {
      setCourse(data)
      if (data.weeks.length == 0) {
        setPrompt(data.prompt);
      }
    });

  }, []);

  async function enhance() {
    try {
      const fullPrompt = `
You are an AI university course generator.
Your task is to given a course, make adjustements to it as per the user's prompt.
You might be given a course with no content, in which case you are expected to generate the course content from scratch.
The prompt field is a string that will be passed on to you in the future for generating individual course content.
Description should be short whereas prompt should be detailed.
Book must preferably have a specific edition number listed.
Source refers to a specific location within the book which where content for the target is located.
Ensure that there is no overlap in content between different courses.

TargetDraft: {
  serial: number,
  text: string,
  source: string
}

WeekDraft: {
  serial: number,
  text: string,
  targets: Targets[]
}

CourseContentDraft: {
  name: string,
  description: string,
  book: string,
  weeks: WeekDraft[]
}

Output must only consist of JSON and nothing else.

Response: CourseContentDraft

Prompt:
${prompt}

Course:
${JSON.stringify(courseContent, null, 4)}
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
      const parsed: CourseContentDraft = JSON.parse(cleaned);

      const courseId = course!.id;
      await invoke("update_course", { courseId, draft: parsed });
      
      setPrompt("");

      const updated = await invoke<Course>("get_course", { courseId });
      setCourse(updated);
    } catch (err) {
      console.error("Enhance failed:", err);
    }
  }

  return (
    course && (
      <div>
        <p className="text-sm font-medium mt-4">{course?.department.code}-{course?.serial}</p>
        <p className="text-lg mt-1">{course?.name}</p>
        <p className="mt-1">{course?.description}</p>
        <p className="mt-1 mb-4">{course?.book}</p>
        <textarea
          className="bg-[#f4f5f6] w-full h-50 p-4 rounded-xl outline-none"
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={enhance} className="button-primary mr-2">Prompt</button>
        {course?.weeks.map((week) => (
          <div key={week.id} className="bg-[#e0e4ea] p-4 mb-4 rounded-xl">
            <p className="text-sm font-medium">WEEK-{week.serial}</p>
            <p className="text-lg mt-1">{week.text}</p>
            {week.targets.map((target) => (
              <div key={target.id} className="mt-2">
                <p>{target.text}</p>
                <p className="text-sm">{target.source}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  );
}

export default Course;
