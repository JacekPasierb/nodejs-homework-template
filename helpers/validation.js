const Joi = require("joi");

const SignupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const LoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const subscriptionSchema = Joi.string().valid("starter", "pro", "business");

module.exports = {
  SignupSchema,
  LoginSchema,
  subscriptionSchema,
};
