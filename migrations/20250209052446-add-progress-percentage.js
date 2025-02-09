module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Progresses", "progressPercentage", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0, // ✅ Ensures existing rows have a default progress
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Progresses", "progressPercentage");
  },
};
