import Joi from "joi";
import { eventColors } from "../models/CalendarEvent.js";

const fields = {
  title: Joi.string().trim().min(2).max(140),
  description: Joi.string().trim().max(1000).allow(""),
  start: Joi.date().iso(),
  end: Joi.date().iso(),
  color: Joi.string().valid(...eventColors),
};
const dates = (value, helpers) => value.end <= value.start ? helpers.error("any.invalid") : value;
const messages = { "any.invalid": "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak" };
export const createEventSchema = Joi.object({ ...fields, title: fields.title.required(), start: fields.start.required(), end: fields.end.required() }).custom(dates).messages(messages);
export const updateEventSchema = Joi.object(fields).min(1).custom((value, helpers) => value.start && value.end ? dates(value, helpers) : value).messages(messages);
