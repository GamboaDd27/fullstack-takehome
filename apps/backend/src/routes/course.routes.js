const express = require("express");
const {User, Course} = require("../../models");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: API for managing courses
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of courses
 */
router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({ include: { model: User, as: "teacher" } });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: A course object
 *       404:
 *         description: Course not found
 */
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, { include: { model: User, as: "teacher" } });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []  # Requires JWT Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       403:
 *         description: Unauthorized to create course
 */
router.post("/", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newCourse = await Course.create({ title, description, teacherId: req.user.id });
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: "Failed to create course" });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []  # Requires JWT Token
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       403:
 *         description: Unauthorized to update course
 *       404:
 *         description: Course not found
 */
router.put("/:id", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: "Failed to update course" });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []  # Requires JWT Token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       403:
 *         description: Unauthorized to delete course
 *       404:
 *         description: Course not found
 */
router.delete("/:id", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

module.exports = router;
