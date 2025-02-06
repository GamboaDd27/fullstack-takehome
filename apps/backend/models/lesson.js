module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define("Lesson", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT }
  });

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, { foreignKey: "courseId", onDelete: "CASCADE" });
    Lesson.hasMany(models.Progress, { foreignKey: "lessonId", as: "progress", onDelete: "CASCADE" });
  };

  return Lesson;
};
