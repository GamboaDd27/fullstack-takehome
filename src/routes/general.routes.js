const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Check if API is running
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get("/healthcheck", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

/**
 * @swagger
 * /protected-route:
 *   get:
 *     summary: Access a protected route
 *     tags: [General]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       401:
 *         description: Unauthorized
 */
router.get("/protected-route", authenticate, (req, res) => {
  res.status(200).json({ message: "Access granted", user: req.user });
});

/**
 * @swagger
 * /admin-route:
 *   get:
 *     summary: Access an admin-only route
 *     tags: [General]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access granted
 *       403:
 *         description: Forbidden
 */
router.get("/admin-route", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.status(200).json({ message: "Admin access granted" });
});

module.exports = router;
