import mongoose from "mongoose";
import Task, { taskStatuses } from "../models/Task.js";
import Lead from "../models/Lead.js";

const taskQuery = (owner, query) => {
  const filter = { owner };
  if (query.status && taskStatuses.includes(query.status))
    filter.status = query.status;
  if (query.search?.trim())
    filter.title = {
      $regex: query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  return filter;
};
const withLead = (query) => query.populate("lead", "name company");

export const listTasks = async (req, res, next) => {
  try {
    const tasks = await withLead(
      Task.find(taskQuery(req.user._id, req.query)).sort({
        status: 1,
        dueAt: 1,
      }),
    );
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { leadId, ...values } = req.body;
    if (leadId) {
      const lead = await Lead.exists({ _id: leadId, owner: req.user._id });
      if (!lead) return res.status(404).json({ message: "Lead topilmadi" });
    }
    const task = await Task.create({
      ...values,
      lead: leadId || null,
      owner: req.user._id,
    });
    await task.populate("lead", "name company");
    res.status(201).json({ message: "Vazifa yaratildi", task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    if (!mongoose.isValidObjectId(taskId))
      return res.status(400).json({ message: "Vazifa ID noto'g'ri" });
    const { leadId, ...values } = req.body;
    if (leadId !== undefined) {
      if (leadId) {
        const lead = await Lead.exists({ _id: leadId, owner: req.user._id });
        if (!lead) return res.status(404).json({ message: "Lead topilmadi" });
      }
      values.lead = leadId || null;
    }
    const task = await withLead(
      Task.findOneAndUpdate({ _id: taskId, owner: req.user._id }, values, {
        new: true,
        runValidators: true,
      }),
    );
    if (!task) return res.status(404).json({ message: "Vazifa topilmadi" });
    res.json({ message: "Vazifa yangilandi", task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      owner: req.user._id,
    });
    if (!task) return res.status(404).json({ message: "Vazifa topilmadi" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
