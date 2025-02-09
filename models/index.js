const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user")(sequelize, Sequelize);
db.Course = require("./course")(sequelize, Sequelize);
db.Lesson = require("./lesson")(sequelize, Sequelize);
db.Progress = require("./progress")(sequelize, Sequelize); // ✅ Add Progress model

// User-Teacher Relationship
db.User.hasMany(db.Course, { foreignKey: "teacherId", as: "courses" });
db.Course.belongsTo(db.User, { foreignKey: "teacherId", as: "teacher" });

// Course-Lesson Relationship
db.Course.hasMany(db.Lesson, { foreignKey: "courseId", as: "lessons" });
db.Lesson.belongsTo(db.Course, { foreignKey: "courseId" });

// User-Lesson Progress Relationship
db.User.hasMany(db.Progress, { foreignKey: "userId", as: "progress" });
db.Lesson.hasMany(db.Progress, { foreignKey: "lessonId", as: "progress" });

db.Progress.belongsTo(db.User, { foreignKey: "userId" });
db.Progress.belongsTo(db.Lesson, { foreignKey: "lessonId" });

module.exports = db;
