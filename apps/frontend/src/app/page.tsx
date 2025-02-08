"use client";
import { useEffect, useState } from "react";
import { fetchCourses, Course } from "../utils/api";

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Courses</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {courses.length > 0 ? (
        <ul>
          {courses.map((course) => (
            <li key={course.id}>{course.title}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
