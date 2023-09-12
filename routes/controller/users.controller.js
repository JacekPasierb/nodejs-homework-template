const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const service = require("../../services/users");
const User = require("../../models/user.model");
const config = require("../../config/config");
const {
  SignupSchema,
  LoginSchema,
  subscriptionSchema,
} = require("../../helpers/validation");
const { send } = require("../../sendGrid");
const { generateKeySync } = require("crypto");
const {
  handleValidationError,
  handleUserConflictError,
  handleUserUnauthorizedError,
  handleUserNotVerifiedEmail,
  handleUserNotFoundError,
  handleUserVerifiedEmailError,
} = require("../../helpers/handleErrors");

require("dotenv").config();

const signup = async (req, res, next) => {
  try {
    const { firstName, email, password } = req.body;
    const { error } = SignupSchema.validate({ firstName, email, password });

    if (error) {
      return handleValidationError(error, res);
    }

    const isUser = await service.findUserByNameOrEmail([
      { firstName },
      { email },
    ]);

    if (isUser) {
      return handleUserConflictError(res, isUser, firstName, email);
    }
    const user = await service.createUser({ firstName, email });

    user.generateAvatar();
    user.setPassword(password);
    user.set("verificationToken", uuidv4());
    await user.save();
    const verificationToken = user.verificationToken;
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
    console.error(error.message);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = LoginSchema.validate({ email, password });

    if (error) {
      return handleValidationError(error, res);
    }
    const user = await service.findUser({ email });

    if (!user || !user.validPassword(password)) {
      return handleUserUnauthorizedError(res, "Email or password is wrong");
    }
    if (!user.verify) {
      return handleUserNotVerifiedEmail(res);
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
  try {
    const { _id } = req.user;
    const user = await service.findUser({ _id });

    if (!user) {
      return handleUserUnauthorizedError(res, "Not authorized");
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
  try {
    const { _id, email, subscription, avatarURL } = req.user;

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const user = await service.findUser({ _id });

    if (!user) {
      return handleUserUnauthorizedError(res, "Not authorized");
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
  try {
    const { subscription } = req.body;
    const { error } = subscriptionSchema.validate(subscription);

    if (error) {
      return handleValidationError(error, res);
    }

    const { _id } = req.user;
    await service.updateUser(_id, { subscription });

  
      res.json({
        status: "success",
        code: 200,
        subscription,
      });
    
  } catch (error) {
    next(error);
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
  await service.updateUser(_id, { avatarURL });

  res.status(200).json({ avatarURL });
};

const verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await service.findUser({ verificationToken });

    if (!user) {
      return handleUserNotFoundError(res);
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
    const user = await service.findUser({ email });

    if (user.verify) {
      return handleUserVerifiedEmailError(res);
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
