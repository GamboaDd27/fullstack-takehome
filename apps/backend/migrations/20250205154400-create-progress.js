module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Progresses", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      completed: { type: Sequelize.BOOLEAN, defaultValue: false },
      userId: { 
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE"
      },
      lessonId: { 
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Lessons", key: "id" },
        onDelete: "CASCADE"
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Progresses");
  }
};
