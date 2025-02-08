const API_BASE = "http://localhost:5000/api";

export interface Course {
  id: string;
  title: string;
  description: string;
}

export interface Progress {
  courseId: string;
  userId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE}/courses`);
  if (!response.ok) throw new Error("Failed to fetch courses");
  return response.json();
}

export async function fetchProgress(courseId: string, token: string): Promise<Progress> {
  const response = await fetch(`${API_BASE}/courses/${courseId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch progress");
  return response.json();
}
