const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get course IDs dynamically
    const courses = await queryInterface.sequelize.query(`SELECT id FROM "Courses"`, {
      type: Sequelize.QueryTypes.SELECT
    });

    const course1 = courses[0]?.id; // Get the first course ID
    const course2 = courses[1]?.id; // Get the second course ID

    await queryInterface.bulkInsert("Lessons", [
      { id: uuidv4(), title: "Alphabet", content: "Learn the English alphabet", courseId: course1, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), title: "Basic Greetings", content: "Say Hello & Goodbye", courseId: course1, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), title: "Verb Tenses", content: "Learn present, past, and future", courseId: course2, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Lessons", null, {});
  }
};
