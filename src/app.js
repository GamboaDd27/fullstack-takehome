const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const lessonRoutes = require("./routes/lesson.routes");
const progressRoutes = require("./routes/progress.routes");

const swaggerDocs = require("./swagger");
const morgan = require('morgan')

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'))

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);

swaggerDocs(app);

if (process.env.NODE_ENV !== "test") {
    const db = require("../models");
    db.sequelize.sync({ force: false }).then(() => console.log("DB synced"));
  }

module.exports = app;
