import Joi from "joi";
import { taskPriorities, taskStatuses } from "../models/Task.js";

const fields = {
  title: Joi.string().trim().min(2).max(160),
  description: Joi.string().trim().max(1000).allow(""),
  status: Joi.string().valid(...taskStatuses),
  priority: Joi.string().valid(...taskPriorities),
  dueAt: Joi.date().iso(),
  leadId: Joi.string().hex().length(24).allow(null, ""),
};

export const createTaskSchema = Joi.object({ ...fields, title: fields.title.required(), dueAt: fields.dueAt.required() });
export const updateTaskSchema = Joi.object(fields).min(1);
