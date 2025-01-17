const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
const gravatar = require("gravatar");
const path = require("path");
const { Schema } = mongoose;

const user = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: String,

    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
  },

  {
    versionKey: false,
    timestamps: true,
  }
);

user.methods.setPassword = function (password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(5));
};

user.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};

user.methods.generateAvatar = function () {
  this.avatarURL = gravatar.url(this.email);
};

const User = mongoose.model("user", user, "users");

module.exports = User;
