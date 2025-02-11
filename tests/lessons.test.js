const request = require("supertest");
const express = require("express");
const { Lesson, Course } = require("../models");
const lessonRouter = require("../src/routes/lesson.routes");

jest.mock("../models");

// ✅ Mock authentication & authorization middleware
jest.mock("../src/middleware/auth.middleware", () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: "550e8400-e29b-41d4-a716-446655440000", role: "teacher" }; // Mocked user
    next();
  }),
  authorize: jest.fn(() => (req, res, next) => next()),
}));

const { authenticate, authorize } = require("../src/middleware/auth.middleware");

const app = express();
app.use(express.json());
app.use("/api/lessons", lessonRouter);

describe("Lesson API", () => {
  let authToken;
  let lessonId;
  let courseId;

  beforeEach(() => {
    lessonId = "550e8400-e29b-41d4-a716-446655440000"; // Example UUID
    courseId = "d1a673a1-4b1f-4675-9b9a-9150cf3adf0d"; // Example UUID
    authToken = "Bearer fake-jwt-token";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * PUT /api/lessons/:id
   */
  it("should update a lesson", async () => {
    // ✅ Fix: Mock `.update()` instead of `.save()`
    const mockLesson = {
      id: lessonId,
      title: "Old Title",
      content: "Old Content",
      update: jest.fn().mockResolvedValue(undefined), // Mock update()
    };

    Lesson.findByPk.mockResolvedValue(mockLesson);

    const res = await request(app)
      .put(`/api/lessons/${lessonId}`)
      .set("Authorization", authToken)
      .send({ title: "Updated Lesson", content: "Updated Content" });

    expect(res.status).toBe(200);
    expect(mockLesson.update).toHaveBeenCalledWith({
      title: "Updated Lesson",
      content: "Updated Content",
    });
  });

  it("should return 404 if lesson to update is not found", async () => {
    Lesson.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/lessons/${lessonId}`)
      .set("Authorization", authToken)
      .send({ title: "Updated Lesson", content: "Updated Content" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Lesson not found");
  });
});
