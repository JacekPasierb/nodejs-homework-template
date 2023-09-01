const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { lock } = require("../routes/api/contacts.routes");

require("dotenv").config();

const signup = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    return res
      .status(409)
      .header("Content-Type", "application/json")
      .json({
        status: "conflict",
        code: 409,
        ResponseBody: {
          message: "Email in use",
        },
      });
  }
  try {
    const newUser = new User({ email });
    newUser.generateAvatar(); 
    newUser.setPassword(password);
    await newUser.save();
    res
      .status(201)
      .header("Content-Type", "application/json")
      .json({
        status: "created",
        code: 201,
        ResponseBody: {
          user: {
            email: email,
            subscription: "starter",
          },
        },
      });
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(401).json({
      status: "unauthorized",
      code: 401,
      ResponseBody: {
        message: "Email or password is wrong",
      },
    });
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1h" });
  user.token = token;
  await user.save();
  res
    .status(200)
    .header("Content-Type", "application/json")
    .json({
      status: "created",
      code: 201,
      ResponseBody: {
        token,
        user: {
          email,
          subscription: "starter", // TODO
        },
      },
    });
};

const logout = async (req, res, next) => {
  const id = req.user._id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(401)
        .header("Content-Type", "application/json")
        .json({
          status: "Unauthorized",
          code: 401,
          ResponseBody: {
            message: "Not authorized",
          },
        });
    }

    user.token = null;
    await user.save();

    res.status(204).json({
      status: "no content",
      code: 204,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  const { _id, email, subscription, avatarURL } = req.user;

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(401)
        .header("Content-Type", "application/json")
        .json({
          status: "Unauthorized",
          code: 401,
          ResponseBody: {
            message: "Not authorized",
          },
        });
    }

    res
      .status(200)
      .header("Content-Type", "application/json")
      .json({
        status: "OK",
        code: 200,
        ResponseBody: {
          email: email,
          subscription: subscription,
          avatarURL:avatarURL,
        },
      });
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionUser = async (req, res, next) => {
  const { subscription } = req.body;
  const validSubscriptions = ["starter", "pro", "business"];

  if (!validSubscriptions.includes(subscription)) {
    return res.status(400).json({
      status: "Bad Request",
      code: 400,
      ResponseBody: {
        message:
          "Invalid subscription value. It should be one of ['starter', 'pro', 'business'].",
      },
    });
  }
  const { _id: id } = req.user;
  const user = await User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true }
  ).exec();
  if (!user) {
    res.status(404);
    throw new Error("Not found");
  } else {
    res.json({
      status: "success",
      code: 200,
      subscription,
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscriptionUser,
};
