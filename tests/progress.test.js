const request = require("supertest");
const express = require("express");
const { Progress, Lesson } = require("../models");
const progressRouter = require("../src/routes/progress.routes");

jest.mock("../models");

// ✅ Mock authentication middleware
jest.mock("../src/middleware/auth.middleware", () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: "550e8400-e29b-41d4-a716-446655440000" }; // Mocked user
    next();
  }),
}));

const { authenticate } = require("../src/middleware/auth.middleware");

const app = express();
app.use(express.json());
app.use("/api/progress", progressRouter);

describe("Progress API", () => {
  let authToken;
  let userId;
  let lessonId;

  beforeEach(() => {
    userId = "550e8400-e29b-41d4-a716-446655440000"; // Example UUID
    lessonId = "d1a673a1-4b1f-4675-9b9a-9150cf3adf0d";
    authToken = "Bearer fake-jwt-token";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * GET /api/progress/
   */
  it("should fetch all completed lessons for logged-in user", async () => {
    Progress.findAll.mockResolvedValue([{ lessonId, userId, completed: true }]);

    const res = await request(app)
      .get("/api/progress")
      .set("Authorization", authToken);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ lessonId, userId, completed: true }]);
    expect(Progress.findAll).toHaveBeenCalledWith({
      where: { userId, completed: true },
      include: { model: Lesson, attributes: ["id", "title"] },
    });
  });

  /**
   * GET /api/progress/:lessonId
   */
  it("should return progress for a specific lesson", async () => {
    Progress.findOne.mockResolvedValue({ lessonId, userId, progressPercentage: 50 });

    const res = await request(app)
      .get(`/api/progress/${lessonId}`)
      .set("Authorization", authToken);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ lessonId, userId, progressPercentage: 50 });
    expect(Progress.findOne).toHaveBeenCalledWith({ where: { lessonId, userId } });
  });

  it("should return 404 if no progress found for lesson", async () => {
    Progress.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/progress/${lessonId}`)
      .set("Authorization", authToken);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("No progress found for this lesson");
  });

  /**
   * POST /api/progress/:lessonId
   */
  it("should mark a lesson as completed", async () => {
    Lesson.findByPk.mockResolvedValue({ id: lessonId });
    Progress.findOne.mockResolvedValue(null);
    Progress.create.mockResolvedValue({ userId, lessonId, completed: true });

    const res = await request(app)
      .post(`/api/progress/${lessonId}`)
      .set("Authorization", authToken);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ userId, lessonId, completed: true });
    expect(Progress.create).toHaveBeenCalledWith({ userId, lessonId, completed: true });
  });

  it("should return 400 if lesson is already completed", async () => {
    Progress.findOne.mockResolvedValue({ userId, lessonId, completed: true });

    const res = await request(app)
      .post(`/api/progress/${lessonId}`)
      .set("Authorization", authToken);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Lesson already completed");
  });

  /**
   * PUT /api/progress/:lessonId
   */
  it("should update progress percentage for a lesson", async () => {
    // ✅ Fix: Mock save method on progress object
    const mockProgress = {
      lessonId,
      userId,
      progressPercentage: 30,
      save: jest.fn().mockResolvedValue(undefined), // Mock save()
    };

    Progress.findOne.mockResolvedValue(mockProgress);

    const res = await request(app)
      .put(`/api/progress/${lessonId}`)
      .set("Authorization", authToken)
      .send({ progressPercentage: 75 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Progress updated");
    expect(Progress.findOne).toHaveBeenCalledWith({ where: { lessonId, userId } });
    expect(mockProgress.progressPercentage).toBe(75);
    expect(mockProgress.save).toHaveBeenCalled();
  });

  it("should return 400 for invalid progress percentage", async () => {
    const res = await request(app)
      .put(`/api/progress/${lessonId}`)
      .set("Authorization", authToken)
      .send({ progressPercentage: 150 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid progress value");
  });

  it("should return 404 if lesson progress is not found", async () => {
    Progress.findOne.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/progress/${lessonId}`)
      .set("Authorization", authToken)
      .send({ progressPercentage: 50 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Lesson progress not found");
  });
});
