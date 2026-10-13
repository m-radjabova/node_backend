import Joi from "joi";

const password = Joi.string()
  .min(8)
  .pattern(/[a-z]/, "kichik harf")
  .pattern(/[A-Z]/, "katta harf")
  .pattern(/[0-9]/, "raqam")
  .pattern(/[^a-zA-Z0-9\s]/, "maxsus belgi")
  .required();

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().pattern(/^\+?[0-9]{9,15}$/),
  jobTitle: Joi.string().trim().max(100),
  company: Joi.string().trim().max(100),
  language: Joi.string().valid("uz", "ru", "en"),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password,
});
