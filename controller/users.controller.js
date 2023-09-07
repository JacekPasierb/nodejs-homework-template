const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/user.model");
const config = require("../config/config");
const {
  SignupSchema,
  LoginSchema,
  subscriptionSchema,
} = require("../helpers/validation");
const { send } = require("../sendGrid");

require("dotenv").config();

const signup = async (req, res, next) => {
  const { email, password } = req.body;

  const { error } = SignupSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({
      statusText: "Bad Request",
      code: 400,
      ResponseBody: {
        message: "Błąd walidacji danych wejściowych",
        details: error.details,
      },
    });
  }

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
    newUser.set("verificationToken", uuidv4());

    await newUser.save();

    const verificationToken = newUser.verificationToken;
    console.log("verify", verificationToken);
    send(email, verificationToken);
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

  const { error } = LoginSchema.validate({ email, password });

  if (error) {
    return res.status(400).json({
      statusText: "Bad Request",
      code: 400,
      ResponseBody: {
        message: "Błąd walidacji danych wejściowych",
        details: error.details,
      },
    });
  }

  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(401).json({
      statusText: "Unauthorized",
      code: 401,
      ResponseBody: {
        message: "Email or password is wrong",
      },
    });
  }
  if (!user.verify) {
    return res.status(403).json({
      statusText: "",
      code: 403,
      ResponseBody: {
        message: "E-mail is not verified",
      },
    });
  }
  try {
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
        statusText: "OK",
        code: 200,
        ResponseBody: {
          token,
          user: {
            email,
            subscription: "starter", // TODO
          },
        },
      });
  } catch (error) {
    next(error);
  }
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
          avatarURL: avatarURL,
        },
      });
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionUser = async (req, res, next) => {
  const { subscription } = req.body;

  const { error } = subscriptionSchema.validate(subscription);

  if (error) {
    return res.status(400).json({
      statusText: "Bad Request",
      code: 400,
      ResponseBody: {
        message:
          "Invalid subscription value. It should be one of ['starter', 'pro', 'business'].",
        details: error.details,
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

const updateAvatars = async (req, res) => {
  const { _id } = req.user;
  const { path: tmpUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(config.AVATARS_PATH, filename);
  await fs.rename(tmpUpload, resultUpload);
  const avatar = await Jimp.read(resultUpload);
  avatar.resize(250, 250);
  avatar.write(resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};

const verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    console.log("weryfikcja - uzytkownik znaleziony to: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.set("verify", true);
    user.verificationToken = null;
    await user.save();
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const reverifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }
    const user = await User.findOne({ email });
    if (user.verify) {
      return res.status(400).json({
        statusText: "Bad Request",
        code: 200,
        ResponseBody: {
          message: "Verification has already been passed",
        },
      });
    }
    const verificationToken = user.verificationToken;
    send(email, verificationToken);
    res.status(200).json({
      statusText: "OK",
      code: 200,
      ResponseBody: {
        message: "Verification email sent",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateSubscriptionUser,
  updateAvatars,
  verifyEmail,
  reverifyEmail,
};
