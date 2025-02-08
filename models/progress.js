module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define("Progress", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false }
  });

  Progress.associate = (models) => {
    Progress.belongsTo(models.User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });
    Progress.belongsTo(models.Lesson, { foreignKey: "lessonId", as: "lesson", onDelete: "CASCADE" });
  };

  return Progress;
};
