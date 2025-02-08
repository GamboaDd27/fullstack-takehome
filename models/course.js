module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    teacherId: { type: DataTypes.UUID, allowNull: false }, // FK to User
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, { foreignKey: "teacherId", as: "teacher" });
  };

  return Course;
};
