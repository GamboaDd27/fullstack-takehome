module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define(
    "Progress",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      lessonId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "Lessons", key: "id" },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      progressPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "Progresses",
      timestamps: true,
    }
  );

  return Progress;
};
