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
 * /api/lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: A list of lessons
 */
router.get("/", async (req, res) => {
    try {
      const lessons = await db.Lesson.findAll({ include: { model: db.Course } });
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });
  
  /**
   * @swagger
   * /api/lessons/{id}:
   *   get:
   *     summary: Get a single lesson by ID
   *     tags: [Lessons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the lesson
   *     responses:
   *       200:
   *         description: A lesson object
   *       404:
   *         description: Lesson not found
   */
  router.get("/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
  
      const lessons = await Lesson.findAll({
        where: { id },
        order: [["createdAt", "ASC"]],
      });
  
      if (!lessons || lessons.length === 0) {
        return res.status(404).json({ error: "No lessons found for this course" });
      }
  
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  /**
   * @swagger
   * /api/courses/{courseId}/lessons:
   *   post:
   *     summary: Create a new lesson under a course
   *     tags: [Lessons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the course
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - content
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *     responses:
   *       201:
   *         description: Lesson created successfully
   *       403:
   *         description: Unauthorized to create lesson
   *       404:
   *         description: Course not found
   */
  router.post("/:courseId", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
    try {
      const { title, content } = req.body;
      const course = await db.Course.findByPk(req.params.courseId);
  
      if (!course) return res.status(404).json({ error: "Course not found" });
  
      if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to add lessons" });
      }
  
      const newLesson = await db.Lesson.create({ title, content, courseId: req.params.courseId });
      res.status(201).json(newLesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });
  
  /**
   * @swagger
   * /api/lessons/{id}:
   *   put:
   *     summary: Update a lesson
   *     tags: [Lessons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the lesson
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
   *         description: Unauthorized to update lesson
   *       404:
   *         description: Lesson not found
   */
  router.put("/:id", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
    try {
      const { title, content } = req.body;
      const lesson = await db.Lesson.findByPk(req.params.id, { include: { model: db.Course } });
  
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  
      if (req.user.role !== "admin" && lesson.Course.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to edit this lesson" });
      }
  
      lesson.title = title || lesson.title;
      lesson.content = content || lesson.content;
      await lesson.save();
  
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lesson" });
    }
  });
  
  /**
   * @swagger
   * /api/lessons/{id}:
   *   delete:
   *     summary: Delete a lesson
   *     tags: [Lessons]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the lesson
   *     responses:
   *       200:
   *         description: Lesson deleted successfully
   *       403:
   *         description: Unauthorized to delete lesson
   *       404:
   *         description: Lesson not found
   */
  router.delete("/:id", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
    try {
      const lesson = await db.Lesson.findByPk(req.params.id, { include: { model: db.Course } });
  
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  
      if (req.user.role !== "admin" && lesson.Course.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to delete this lesson" });
      }
  
      await lesson.destroy();
      res.json({ message: "Lesson deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lesson" });
    }
  });
  
  module.exports = router;
  