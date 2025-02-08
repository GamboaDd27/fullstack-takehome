const { v4: uuidv4 } = require("uuid");
const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const userId = uuidv4();
const User = dbMock.define("User", {
  id: userId,
  name: "Test User",
  email: "test@example.com",
  password: "hashedpassword",
  role: "student"
});

// Manually add `findByPk`
User.findByPk = async (id) => {
  return id === userId ? User.build({ id: userId, email: "test@example.com" }) : null;
};

describe("User Model", () => {
  test("should create a new user", async () => {
    const user = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "hashedpassword",
      role: "teacher"
    });

    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
    expect(user.role).toBe("teacher");
  });

  test("should find a user by ID", async () => {
    const user = await User.findByPk(userId); // Ensure ID is passed correctly
    expect(user).not.toBeNull();
    expect(user.email).toBe("test@example.com");
  });
});
