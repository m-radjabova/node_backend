import express from "express";
import Joi from "joi";
import mongoose from "mongoose";
import Student from "../models/Student.js";

const router = express.Router();

const subjectValidation = Joi.object({
  subjectName: Joi.string().required(),
  grade: Joi.number().min(0).max(5).required(),
});

const createStudentValidation = Joi.object({
  name: Joi.string().required(),
  group: Joi.string().required(),
  subjects: Joi.array().items(subjectValidation).default([]),
});

const updateStudentValidation = Joi.object({
  name: Joi.string(),
  group: Joi.string(),
  subjects: Joi.array().items(subjectValidation),
}).min(1);

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

router.get("/", async (req, res) => {
  try {
    const students = await Student.find();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "ID noto'g'ri" });
    }

    const student = await Student.findOne({ _id: id });

    if (!student) {
      return res.status(404).json({ message: "Talaba topilmadi" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = createStudentValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const newStudent = new Student(value);
    await newStudent.save();

    res.status(201).json({
      message: "Talaba qo'shildi",
      student: newStudent,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "ID noto'g'ri" });
    }

    const { error, value } = updateStudentValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const result = await Student.updateOne(
      { _id: id },
      {
        $set: value,
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Talaba topilmadi" });
    }

    const updatedStudent = await Student.findOne({ _id: id });

    res.json({
      message: "Talaba yangilandi",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "ID noto'g'ri" });
    }

    const result = await Student.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Talaba topilmadi" });
    }

    res.json({ message: "Talaba o'chirildi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
