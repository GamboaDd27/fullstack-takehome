module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT }
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, { foreignKey: "teacherId", as: "teacher", onDelete: "CASCADE" });
    Course.hasMany(models.Lesson, { foreignKey: "courseId", as: "lessons", onDelete: "CASCADE" });
  };

  return Course;
};
