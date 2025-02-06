const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await queryInterface.bulkInsert("Users", [
      { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Admin User", email: "admin@example.com", password: hashedPassword, role: "admin", createdAt: new Date(), updatedAt: new Date() },
      { id: "b2c3d4e5-f678-90ab-cdef-1234567890ab", name: "Teacher One", email: "teacher1@example.com", password: hashedPassword, role: "teacher", createdAt: new Date(), updatedAt: new Date() },
      { id: "c3d4e5f6-7890-abcd-ef12-34567890abcd", name: "Student One", email: "student1@example.com", password: hashedPassword, role: "student", createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Users", null, {});
  }
};
