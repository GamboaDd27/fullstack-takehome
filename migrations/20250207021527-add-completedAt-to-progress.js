module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Progresses", "completedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Progresses", "completedAt");
  },
};
