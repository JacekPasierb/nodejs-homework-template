const Joi = require("joi");

const SignupSchema = Joi.object({
  firstName: Joi.string().min(3).trim().required().messages({
    "string.base": "First Name must be a string",
    "string.min": "First name must be at least 3 characters long",
    "any.required": "First name is required",
  }),
  email: Joi.string().email().trim().required().messages({
    "string.base": "E-mail must be a string",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).trim().required().messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

const LoginSchema = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.base": "E-mail must be a string",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).trim().required().messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

const subscriptionSchema = Joi.string()
  .valid("starter", "pro", "business")
  .required()
  .messages({
    "string.base": "Subscription must be a string",
    "any.required": "Missing field subscription",
    "any.only":
      "Subscription must be one of these values - [starter, pro, business]",
  });

module.exports = {
  SignupSchema,
  LoginSchema,
  subscriptionSchema,
};
