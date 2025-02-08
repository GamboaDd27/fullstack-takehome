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

db.User.hasMany(db.Course, { foreignKey: "teacherId", as: "courses" });
db.Course.belongsTo(db.User, { foreignKey: "teacherId", as: "teacher" });

db.Course.hasMany(db.Lesson, { foreignKey: "courseId", as: "lessons" });
db.Lesson.belongsTo(db.Course, { foreignKey: "courseId" });

module.exports = db;
