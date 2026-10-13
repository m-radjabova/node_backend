import Joi from "joi";

export const updateRoleSchema = Joi.object({
  role: Joi.string().valid("user", "manager", "admin").required(),
});
