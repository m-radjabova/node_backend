import Joi from "joi";

const password = Joi.string()
  .min(8)
  .pattern(/[a-z]/, "kichik harf")
  .pattern(/[A-Z]/, "katta harf")
  .pattern(/[0-9]/, "raqam")
  .pattern(/[^a-zA-Z0-9\s]/, "maxsus belgi")
  .required()
  .messages({ "string.min": "Parol kamida 8 belgidan iborat bo'lishi kerak" });

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().lowercase().required(),
  password,
  role: Joi.string().valid("user", "manager").default("manager"),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });
