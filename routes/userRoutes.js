import express from "express";
import bcrypt from "bcrypt";
import Joi from "joi";
import User from "../models/User.js";

const router = express.Router();
const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\s])\S{8,}$/;

const schema = Joi.object({
  username: Joi.string().pattern(usernameRegex).required(),
  email: Joi.string().pattern(emailReqgex).required(),
  password: Joi.string().pattern(passwordRegex).required(),
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    const { username, email, password } = value;
    const exists = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (exists) {
      return res.status(409).json({
        message: "Username yoki email band",
      });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      name: username,
      email,
      passwordHash,
    });
    res.status(201).json({
      message: "User yaratildi",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username yoki email band",
      });
    }
    res.status(500).json({
      message: "Server xatosi",
    });
  }
});

const buildUserFilter = (name, city, skill, minAge, maxAge) => {
  const filter = {};

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (city) {
    filter.city = city;
  }

  if (skill) {
    filter.skills = skill;
  }

  if (minAge !== undefined) {
    filter.age = { ...filter.age, $gt: minAge };
  }

  if (maxAge !== undefined) {
    filter.age = { ...filter.age, $lt: maxAge };
  }

  return filter;
};

const schemaUser = Joi.object({
  name: Joi.string(),
  city: Joi.string(),
  skill: Joi.string(),
  minAge: Joi.number(),
  maxAge: Joi.number(),
  pageNumber: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});

router.get("/search", async (req, res) => {
  try {
    const { error, value } = schemaUser.validate(req.query);
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    const {
      name,
      city,
      skill,
      minAge,
      maxAge,
      pageNumber,
      pageSize,
    } = value;
    const filter = buildUserFilter(
      name,
      city,
      skill,
      minAge,
      maxAge
    );
    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ name: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const totalUsers = users.length;

    return res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      pageNumber,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server xatosi",
    });
  }
});


export default router;