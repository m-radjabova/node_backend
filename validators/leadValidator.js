import Joi from "joi";

const statuses = ["new", "in_progress", "proposal", "won", "lost"];
const phone = Joi.string().trim().pattern(/^\+?[0-9]{9,15}$/);

const leadFields = {
  name: Joi.string().trim().min(2).max(120),
  company: Joi.string().trim().max(120).allow(""),
  description: Joi.string().trim().max(1000).allow(""),
  value: Joi.number().min(0),
  contactName: Joi.string().trim().max(100).allow(""),
  contactEmail: Joi.string().email().lowercase().allow(""),
  contactPhone: phone.allow(""),
  nextActionAt: Joi.date().iso().allow(null, ""),
  nextActionType: Joi.string().valid("call", "meeting", "follow_up"),
};

export const createLeadSchema = Joi.object({
  ...leadFields,
  status: Joi.string().valid(...statuses).default("new"),
  name: leadFields.name.required(),
});

export const updateLeadSchema = Joi.object(leadFields).min(1);

export const updateLeadStatusSchema = Joi.object({
  status: Joi.string().valid(...statuses).required(),
});
