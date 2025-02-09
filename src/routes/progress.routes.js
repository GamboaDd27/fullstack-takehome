const express = require("express");
const {Progress} = require("../../models");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: API for tracking student progress
 */

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get all completed lessons for the logged-in student
 *     tags: [Progress]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of completed lessons
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, authorize(["student"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const progress = await db.Progress.findAll({
        where: { userId, completed: true },
        include: { model: db.Lesson, attributes: ["id", "title"] }
      });
  
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });
  
  /**
 * @swagger
 * /api/progress/{lessonId}:
 *   get:
 *     summary: Get progress for a specific lesson
 *     description: Returns progress for the given lesson and user.
 *     tags:
 *       - Progress
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         description: The ID of the lesson to fetch progress for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress for the lesson.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessonId:
 *                   type: string
 *                   example: "lesson123"
 *                 userId:
 *                   type: string
 *                   example: "user456"
 *                 progressPercentage:
 *                   type: number
 *                   example: 75
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No progress found for the lesson.
 *       500:
 *         description: Server error.
 */
router.get("/:lessonId", authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id; // Extract user ID from authenticated request

    console.log(`🔍 Fetching progress for lesson: ${lessonId}, user: ${userId}`);

    const progress = await Progress.findOne({
      where: { lessonId, userId },
    });

    if (!progress) {
      console.warn(`⚠️ No progress found for lesson ${lessonId} and user ${userId}`);
      return res.status(404).json({ error: "No progress found for this lesson" });
    }

    res.json(progress);
  } catch (error) {
    console.error("❌ Error fetching progress:", error);
    res.status(500).json({ error: "Server error" });
  }
});
  
  /**
   * @swagger
   * /api/progress/{lessonId}:
   *   post:
   *     summary: Mark a lesson as complete
   *     tags: [Progress]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the lesson
   *     responses:
   *       201:
   *         description: Lesson marked as completed
   *       400:
   *         description: Lesson already completed
   *       404:
   *         description: Lesson not found
   */
  router.post("/:lessonId", authenticate, authorize(["student"]), async (req, res) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;
  
      // Check if lesson exists
      const lesson = await db.Lesson.findByPk(lessonId);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  
      // Check if progress already exists
      let progress = await db.Progress.findOne({ where: { userId, lessonId } });
  
      if (progress) {
        return res.status(400).json({ error: "Lesson already completed" });
      }
  
      // Mark lesson as completed
      progress = await db.Progress.create({ userId, lessonId, completed: true });
      res.status(201).json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });
  
  /**
   * @swagger
   * /api/progress/{lessonId}:
   *   delete:
   *     summary: Unmark a lesson as complete (Undo progress)
   *     tags: [Progress]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the lesson
   *     responses:
   *       200:
   *         description: Lesson unmarked as completed
   *       404:
   *         description: Lesson is not marked as completed
   */
  router.delete("/:lessonId", authenticate, authorize(["student"]), async (req, res) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;
  
      // Find the progress entry
      const progress = await db.Progress.findOne({ where: { userId, lessonId, completed: true } });
  
      if (!progress) {
        return res.status(404).json({ error: "Lesson is not marked as completed" });
      }
  
      // Delete progress entry
      await progress.destroy();
      res.json({ message: "Lesson unmarked as completed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove progress" });
    }
  });
  
/**
 * @swagger
 * /courses/{courseId}/progress:
 *   get:
 *     summary: Get user's course progress percentage
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns progress details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courseId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 completedLessons:
 *                   type: integer
 *                 totalLessons:
 *                   type: integer
 *                 progressPercentage:
 *                   type: number
 *                   format: float
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching progress
 */
router.get("/:courseId/progress", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const totalLessons = await Lesson.count({ where: { courseId } });
    const completedLessons = await Progress.count({
      where: { userId, completedAt: { [Op.ne]: null } },
      include: { model: Lesson, where: { courseId } }
    });

    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    res.json({ courseId, userId, completedLessons, totalLessons, progressPercentage });
  } catch (error) {
    res.status(500).json({ error: "Error fetching progress" });
  }
});

  module.exports = router;
  