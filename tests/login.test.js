const mongoose = require("mongoose");
const request = require("supertest");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

const app = require("../app");
const User = require("../models/user.model");

const databaseHost = process.env.DATABASE_URL;

const testUser = {
  firstName: "test",
  email: "test11@o2.pl",
  password: bcrypt.hashSync("test1111", bcrypt.genSaltSync()),
  avatarURL: gravatar.url("test11@o2.pl", { s: "250", r: "pg", d: "mp" }, true),
  pubId: Math.random(),
  verify: true,
};

const simulateSuccessfulLogin = async () => {
  try {
    const response = await request(app).post("/api/users/login").send({
      email: "test11@o2.pl",
      password: "test1111",
    });

    return response.body;
  } catch (error) {
    throw new Error(error);
  }
};

const simulateUnsuccessfulLogin = async () => {
  try {
    const response = await request(app).post("/api/users/login").send({
      email: "test1@o2.pl",
      password: "test1111",
    });

    return response.body;
  } catch (error) {
    throw new Error(error);
  }
};

const simulateValidationLoginError = async () => {
  try {
    const response = await request(app).post("/api/users/login").send({
      email: "test@o.p",
    });

    return response.body;
  } catch (error) {
    throw new Error(error);
  }
};

describe("User Login Tests", () => {
  let loginResponse;

  beforeAll(async () => {
    try {
      await mongoose.connect(databaseHost, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const user = await new User(testUser);
      await user.save();
    } catch (error) {
      throw new Error(error);
    }
  });

  afterAll(async () => {
    try {
      await User.findOneAndRemove({ email: testUser.email });

      await mongoose.disconnect();
    } catch (error) {
      throw new Error(error);
    }
  });

  beforeEach(async () => {
    loginResponse = await simulateSuccessfulLogin();
  });

  test("Should return status 200 OK", () => {
    console.log("login", loginResponse);
    const { code, statusText } = loginResponse;
    expect(code).toBe(200);
    expect(statusText).toBe("OK");
  });

  test("Should return an authentication token", () => {
    const { token } = loginResponse.ResponseBody;
    expect(typeof token).toBe("string");
    expect(token).toBeTruthy();
  });

  test("Should return a user object with valid email and subscription fields", () => {
    const { user } = loginResponse.ResponseBody;

    expect(user).toMatchObject({
      email: expect.any(String),
      subscription: expect.any(String),
    });

    expect(user.email).toBeTruthy();
    expect(user.subscription).toBeTruthy();
  });

  describe("Unsuccessful User Login", () => {
    let unsuccessfulLoginResponse;

    beforeEach(async () => {
      unsuccessfulLoginResponse = await simulateUnsuccessfulLogin();
    });

    test("Should return status 401 Unauthorized", () => {
      console.log("log", unsuccessfulLoginResponse);
      const { code, statusText } = unsuccessfulLoginResponse;
      expect(code).toBe(401);
      expect(statusText).toBe("Unauthorized");
    });

    test("Should return error message 'Email or password is wrong'", () => {
      const {
        ResponseBody: { message },
      } = unsuccessfulLoginResponse;
      expect(message).toBe("Email or password is wrong");
    });
  });

  describe("User Login Validation Error", () => {
    let validationErrorResponse;

    beforeEach(async () => {
      validationErrorResponse = await simulateValidationLoginError();
    });

    test("Should return status 400 Bad Request", () => {
      console.log("val", validationErrorResponse);
      const { code, statusText } = validationErrorResponse;
      expect(code).toBe(400);
      expect(statusText).toBe("Bad Request");
    });

    test("Should return a valid error message", () => {
      const { ResponseBody } = validationErrorResponse;

      expect(ResponseBody).toMatchObject({
        message: expect.any(String),
      });

      expect(ResponseBody.message).toBeTruthy();
    });
  });
});
