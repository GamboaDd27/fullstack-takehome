const express = require("express");
const { Progress, Lesson } = require("../../models");
const { authenticate } = require("../middleware/auth.middleware");
const { Op } = require("sequelize");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: API for tracking student progress
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Progress:
 *       type: object
 *       required:
 *         - lessonId
 *         - userId
 *         - progressPercentage
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the progress entry
 *         lessonId:
 *           type: string
 *           format: uuid
 *           description: The UUID of the lesson
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The UUID of the user
 *         progressPercentage:
 *           type: number
 *           description: Percentage of lesson completed (0-100)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Progress'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await Progress.findAll({
      where: { userId, completed: true },
      include: { model: Lesson, attributes: ["id", "title"] },
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
 *     tags: [Progress]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the lesson to fetch progress for
 *     responses:
 *       200:
 *         description: Progress details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Progress'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No progress found for the lesson
 *       500:
 *         description: Server error
 */
router.get("/:lessonId", authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Fetching progress for lesson: ${lessonId}, user: ${userId}`);

    const progress = await Progress.findOne({ where: { lessonId, userId } });

    if (!progress) {
      return res.status(404).json({ error: "No progress found for this lesson" });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /api/progress/{lessonId}:
 *   post:
 *     summary: Mark a lesson as started
 *     tags: [Progress]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the lesson
 *     responses:
 *       201:
 *         description: Lesson marked as completed
 *       400:
 *         description: Lesson already completed
 *       404:
 *         description: Lesson not found
 */
router.post("/:lessonId", authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // Check if lesson exists
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Check if progress already exists
    let progress = await Progress.findOne({ where: { userId, lessonId } });
    if (progress) {
      return res.status(400).json({ error: "Lesson already completed" });
    }

    progress = await Progress.create({ userId, lessonId, completed: true });
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

/**
 * @swagger
 * /api/progress/{lessonId}:
 *   put:
 *     summary: Update lesson progress percentage
 *     description: Allows a student to update their progress for a specific lesson.
 *     tags: [Progress]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the lesson
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progressPercentage:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       400:
 *         description: Invalid progress value
 *       404:
 *         description: Lesson progress not found
 *       500:
 *         description: Server error
 */
router.put("/:lessonId", authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { progressPercentage } = req.body;
    const userId = req.user.id;

    if (typeof progressPercentage !== "number" || progressPercentage < 0 || progressPercentage > 100) {
      return res.status(400).json({ error: "Invalid progress value" });
    }

    let progress = await Progress.findOne({ where: { lessonId, userId } });

    if (!progress) {
      return res.status(404).json({ error: "Lesson progress not found" });
    }

    progress.progressPercentage = progressPercentage;
    await progress.save();

    res.json({ message: "Progress updated", progress });
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

module.exports = router;
