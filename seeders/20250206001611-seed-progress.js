const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch all lesson IDs dynamically
    const lessons = await queryInterface.sequelize.query(
      `SELECT id FROM "Lessons" ORDER BY "createdAt" ASC LIMIT 2`, 
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (lessons.length < 2) {
      console.warn("⚠️ Not enough lessons found! Ensure lessons are seeded first.");
      return;
    }

    const lesson1 = lessons[0].id;
    const lesson2 = lessons[1].id;

    await queryInterface.bulkInsert("Progresses", [
      {
        id: uuidv4(),
        userId: "c3d4e5f6-7890-abcd-ef12-34567890abcd",
        lessonId: lesson1,
        completedAt: new Date(),
        createdAt: new Date(), // ✅ Use correct case
        updatedAt: new Date(), // ✅ Use correct case
      },
      {
        id: uuidv4(),
        userId: "c3d4e5f6-7890-abcd-ef12-34567890abcd",
        lessonId: lesson2,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Progresses", null, {});
  }
};
