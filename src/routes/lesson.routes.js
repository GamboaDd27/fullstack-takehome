const express = require("express");
const { Lesson, Course } = require("../../models");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: API for managing lessons
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - courseId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated UUID of the lesson
 *         title:
 *           type: string
 *           description: Title of the lesson
 *         content:
 *           type: string
 *           description: Lesson content
 *         courseId:
 *           type: string
 *           format: uuid
 *           description: The UUID of the associated course
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         title: "Introduction to JavaScript"
 *         content: "This lesson covers JavaScript basics."
 *         courseId: "d1a673a1-4b1f-4675-9b9a-9150cf3adf0d"
 *         createdAt: "2025-02-10T12:00:00Z"
 *         updatedAt: "2025-02-10T12:00:00Z"
 */

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Retrieve all lessons
 *     description: Fetch a list of all available lessons, including their associated courses.
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: A list of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.findAll({ include: { model: Course } });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Retrieve a specific lesson by UUID
 *     description: Fetch a single lesson by its UUID, including the associated course.
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the lesson to retrieve
 *     responses:
 *       200:
 *         description: The requested lesson object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, { include: { model: Course } });
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /api/lessons/{courseId}:
 *   post:
 *     summary: Create a new lesson for a specific course
 *     description: Teachers and admins can create a new lesson under a specific course.
 *     tags: [Lessons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the course to add the lesson to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lesson'
 *     responses:
 *       201:
 *         description: Lesson successfully created
 *       403:
 *         description: Unauthorized action
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.post("/:courseId", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, content } = req.body;
    const course = await Course.findByPk(req.params.courseId);

    if (!course) return res.status(404).json({ error: "Course not found" });

    const newLesson = await Lesson.create({ title, content, courseId: req.params.courseId });
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update an existing lesson
 *     description: Allows teachers and admins to update a lesson.
 *     tags: [Lessons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the lesson to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       403:
 *         description: Unauthorized action
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, content } = req.body;
    const lesson = await Lesson.findByPk(req.params.id);

    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    await lesson.update({ title, content });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Failed to update lesson" });
  }
});


module.exports = router;
