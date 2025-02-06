const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get lesson IDs dynamically
    const lessons = await queryInterface.sequelize.query(`SELECT id FROM "Lessons"`, {
      type: Sequelize.QueryTypes.SELECT
    });

    const lesson1 = lessons[0]?.id;
    const lesson2 = lessons[1]?.id;

    await queryInterface.bulkInsert("Progresses", [
      { id: uuidv4(), userId: "c3d4e5f6-7890-abcd-ef12-34567890abcd", lessonId: lesson1, completed: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), userId: "c3d4e5f6-7890-abcd-ef12-34567890abcd", lessonId: lesson2, completed: false, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Progresses", null, {});
  }
};
