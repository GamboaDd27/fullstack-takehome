module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { 
      type: DataTypes.ENUM("student", "teacher", "admin"), 
      allowNull: false, 
      defaultValue: "student" 
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Course, { foreignKey: "teacherId", as: "courses", onDelete: "CASCADE" });
    User.hasMany(models.Progress, { foreignKey: "userId", as: "progress", onDelete: "CASCADE" });
  };

  return User;
};
