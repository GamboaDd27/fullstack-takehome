const request = require("supertest");
const express = require("express");
const { Course } = require("../models");
const courseRouter = require("../src/routes/course.routes");

jest.mock("../models");

// ✅ Mock authentication & authorization middleware
jest.mock("../src/middleware/auth.middleware", () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: "550e8400-e29b-41d4-a716-446655440000", role: "teacher" };
    next();
  }),
  authorize: jest.fn(() => (req, res, next) => next()),
}));

const { authenticate, authorize } = require("../src/middleware/auth.middleware");

const app = express();
app.use(express.json());
app.use("/api/courses", courseRouter);

describe("PUT /api/courses/:id", () => {
  let authToken;
  let courseId;

  beforeEach(() => {
    courseId = "d1a673a1-4b1f-4675-9b9a-9150cf3adf0d"; // Example UUID
    authToken = "Bearer fake-jwt-token";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update a course successfully", async () => {
    // ✅ Fix: Mock `.update()` to prevent Sequelize errors
    const mockCourse = {
      id: courseId,
      title: "Old Title",
      description: "Old Description",
      teacherId: "550e8400-e29b-41d4-a716-446655440000",
      update: jest.fn().mockResolvedValue(undefined), // Mock update()
    };

    Course.findByPk.mockResolvedValue(mockCourse);

    const res = await request(app)
      .put(`/api/courses/${courseId}`)
      .set("Authorization", authToken)
      .send({ title: "Updated Course", description: "Updated Description" });

    expect(res.status).toBe(200);
    expect(mockCourse.update).toHaveBeenCalledWith({
      title: "Updated Course",
      description: "Updated Description",
    });
  });

  it("should return 404 if course not found", async () => {
    Course.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/courses/${courseId}`)
      .set("Authorization", authToken)
      .send({ title: "Updated Course", description: "Updated Description" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Course not found");
  });

  it("should return 403 if user is unauthorized to update the course", async () => {
    // ✅ Fix: Ensure course exists before checking authorization
    Course.findByPk.mockResolvedValue({
      id: courseId,
      title: "Old Title",
      description: "Old Description",
      teacherId: "another-teacher-id", // Different user
    });

    const res = await request(app)
      .put(`/api/courses/${courseId}`)
      .set("Authorization", authToken)
      .send({ title: "Updated Course", description: "Updated Description" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Unauthorized action");
  });
});
