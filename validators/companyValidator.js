import Joi from "joi";
import { companyStatuses } from "../models/Company.js";

const phone = Joi.string().trim().pattern(/^\+?[0-9()\-\s]{9,20}$/);
const website = Joi.string().trim().uri({ scheme: ["http", "https"] }).max(255);

const fields = {
  name: Joi.string().trim().min(2).max(140),
  industry: Joi.string().trim().max(100).allow(""),
  description: Joi.string().trim().max(1000).allow(""),
  contactName: Joi.string().trim().max(100).allow(""),
  contactEmail: Joi.string().email().lowercase().max(254).allow(""),
  contactPhone: phone.allow(""),
  website: website.allow(""),
  status: Joi.string().valid(...companyStatuses),
};

export const createCompanySchema = Joi.object({
  ...fields,
  name: fields.name.required(),
  status: fields.status.default("prospect"),
});

export const updateCompanySchema = Joi.object(fields).min(1);
