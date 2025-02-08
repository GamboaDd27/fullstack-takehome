/**
 * auth.routes.test.js
 *
 * This file tests the /register and /login routes using supertest.
 */

const request = require("supertest");
const express = require("express");
const router = require("../../src/routes/auth.routes");
const { User } = require("../../models"); // 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../models", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn()
  }
}));
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn()
}));

const app = express();
app.use(express.json());
app.use("/api/auth", router);


process.env.JWT_SECRET = "test_jwt_secret";

describe("Auth Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------
  // TEST /register
  // ----------------------------------------------------
  describe("POST /api/auth/register", () => {
    it("should create a new user and return 201", async () => {
      // Arrange: mock successful user creation
      bcrypt.hash.mockResolvedValue("hashed_password");
      User.create.mockResolvedValue({
        id: 1,
        name: "TestUser",
        email: "test@example.com",
        password: "hashed_password",
        role: "student"
      });

      // Act: perform the request
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "TestUser",
          email: "test@example.com",
          password: "password123",
          role: "student"
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "User created");
      expect(response.body).toHaveProperty("user");
      expect(User.create).toHaveBeenCalledWith({
        name: "TestUser",
        email: "test@example.com",
        password: "hashed_password",
        role: "student"
      });
    });

    it("should return 400 if an error occurs during registration", async () => {
      // Arrange: mock an error (e.g., unique constraint error or something else)
      const mockError = new Error("Some validation error");
      User.create.mockRejectedValue(mockError);

      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "BadUser",
          email: "bad@example.com",
          password: "password123",
          role: "student"
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Some validation error");
    });
  });

  // ----------------------------------------------------
  // TEST /login
  // ----------------------------------------------------
  describe("POST /api/auth/login", () => {
    it("should return a token when credentials are valid", async () => {
      // Arrange
      const mockUser = {
        id: 123,
        email: "valid@example.com",
        password: "hashed_pass",
        role: "student"
      };
      User.findOne.mockResolvedValue(mockUser);        // Found user
      bcrypt.compare.mockResolvedValue(true);          // Password matches
      jwt.sign.mockReturnValue("mock_jwt_token");      // Fake JWT token

      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "valid@example.com", password: "password123" });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token", "mock_jwt_token");

      // Confirm we called findOne, compare, sign with correct arguments
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: "valid@example.com" } });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed_pass");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 123, role: "student" },
        "test_jwt_secret",
        { expiresIn: "1h" }
      );
    });

    it("should return 401 if credentials are invalid (user not found or bad password)", async () => {
      // Case A: user not found
      User.findOne.mockResolvedValue(null);

      let response = await request(app)
        .post("/api/auth/login")
        .send({ email: "invalid@example.com", password: "pass" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");

      // Case B: user found but password doesn't match
      const mockUser = { id: 999, email: "some@example.com", password: "hashed_pass", role: "student" };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      response = await request(app)
        .post("/api/auth/login")
        .send({ email: "some@example.com", password: "wrongpass" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should return 400 if an error is thrown during login", async () => {
      // Arrange: mock an unexpected error
      User.findOne.mockRejectedValue(new Error("Database is down"));

      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "any@example.com", password: "any" });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Database is down");
    });
  });
});
