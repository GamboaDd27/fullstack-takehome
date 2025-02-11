const express = require("express");
const { User, Course, Lesson } = require("../../models");
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
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated UUID of the course
 *         title:
 *           type: string
 *           description: Title of the course
 *         description:
 *           type: string
 *           description: Course description
 *         teacherId:
 *           type: string
 *           format: uuid
 *           description: The UUID of the teacher assigned to the course
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         title: "Advanced Python"
 *         description: "An in-depth course on Python programming"
 *         teacherId: "d1a673a1-4b1f-4675-9b9a-9150cf3adf0d"
 *         createdAt: "2025-02-10T12:00:00Z"
 *         updatedAt: "2025-02-10T12:00:00Z"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: { model: User, as: "teacher", attributes: { exclude: ["password"] } },
    });
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a single course by UUID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the course
 *     responses:
 *       200:
 *         description: A course object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: { model: User, as: "teacher", attributes: { exclude: ["password"] } },
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    console.error("❌ Error fetching course:", error);
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
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       403:
 *         description: Unauthorized to create course
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newCourse = await Course.create({ title, description, teacherId: req.user.id });
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
});


/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     description: Allows teachers and admins to update a course.
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the course to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Course Title"
 *               description:
 *                 type: string
 *                 example: "Updated description of the course"
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       403:
 *         description: Unauthorized to update course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findByPk(req.params.id);

    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    await course.update({ title, description });
    res.json(course);
  } catch (error) {
    console.error("❌ Error updating course:", error);
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
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the course
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       403:
 *         description: Unauthorized to delete course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticate, authorize(["teacher", "admin"]), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
});


/**
 * @swagger
 * /api/courses/{courseId}/lessons:
 *   get:
 *     summary: Get all lessons for a specific course
 *     description: Returns a list of lessons associated with a given course.
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
 *         description: The UUID of the course to fetch lessons for
 *     responses:
 *       200:
 *         description: A list of lessons for the course
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: No lessons found for the course
 *       500:
 *         description: Server error
 */
router.get("/:courseId/lessons", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify if the course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Fetch lessons for the given course
    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["createdAt", "ASC"]],
    });

    if (lessons.length === 0) {
      return res.status(404).json({ error: "No lessons found for this course" });
    }

    res.json(lessons);
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});


module.exports = router;
