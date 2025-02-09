const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Fetch a valid user dynamically
      const users = await queryInterface.sequelize.query(
        `SELECT id FROM "Users" ORDER BY "createdAt" ASC LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (users.length === 0) {
        console.warn("⚠️ No users found! Ensure users are seeded first.");
        return;
      }

      const userId = users[0].id;

      // Fetch at least 2 lessons dynamically
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

      console.log(`✅ Seeding progress for user: ${userId} on lessons: ${lesson1}, ${lesson2}`);

      await queryInterface.bulkInsert("Progresses", [
        {
          id: uuidv4(),
          userId: userId, // ✅ Dynamically assigned
          lessonId: lesson1,
          completed: true,
          progressPercentage: 100, // ✅ Fully completed lesson
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          userId: userId,
          lessonId: lesson2,
          completed: false,
          progressPercentage: 50, // ✅ Example partial progress
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
    } catch (error) {
      console.error("❌ Error seeding progress:", error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Progresses", null, {});
  }
};
