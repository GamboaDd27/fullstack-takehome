/**
 * auth.middleware.test.js
 *
 * This file tests that `req.user` is set by our `authenticate` middleware
 * when a valid token is provided, and the corresponding user is found.
 */

jest.mock("../../models", () => ({
  User: {
    findByPk: jest.fn()
  }
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

const { User } = require("../../models");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../../src/middleware/auth.middleware");

describe("Auth Middleware - req.user test", () => {
  let req, res, next;

  // Reset mocks before each test
  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test("should set req.user when token is valid and user is found", async () => {
    // Mock the header to return a 'Bearer' token
    req.header.mockReturnValue("Bearer valid_token");

    // Mock jwt.verify to return a payload with an id
    jwt.verify.mockReturnValue({ id: 123 });

    // Mock User.findByPk to return a user object
    User.findByPk.mockResolvedValue({ id: 123, name: "TestUser" });

    // Call the middleware
    await authenticate(req, res, next);

    // Check that req.user is set
    expect(req.user).toEqual({ id: 123, name: "TestUser" });

    // Also confirm next() was called (so the request proceeds)
    expect(next).toHaveBeenCalled();

    // Ensure we didn't get an error response
    expect(res.status).not.toHaveBeenCalled();
  });
});
