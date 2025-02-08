const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Courses", [
      { id: uuidv4(), title: "English for Kids", description: "Basic English learning", teacherId: "b2c3d4e5-f678-90ab-cdef-1234567890ab", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), title: "Advanced English", description: "Grammar and pronunciation", teacherId: "b2c3d4e5-f678-90ab-cdef-1234567890ab", createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Courses", null, {});
  }
};
