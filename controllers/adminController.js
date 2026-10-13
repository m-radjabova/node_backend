import mongoose from "mongoose";
import User from "../models/User.js";

// 1. Barcha foydalanuvchilarni olish
export const listUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || "";

    // Foydalanuvchilarni qidirish
    const filter = {
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Foydalanuvchilarni olish
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Foydalanuvchilar soni
    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};


// 2. Foydalanuvchilar statistikasini olish
export const getUserStats = async (req, res, next) => {
  try {
    const total = await User.countDocuments();

    const administrators = await User.countDocuments({
      role: "admin",
    });

    const managers = await User.countDocuments({
      role: "manager",
    });

    const active = await User.countDocuments({
      isActive: true,
    });

    res.json({
      total,
      administrators,
      managers,
      active,
    });
  } catch (error) {
    next(error);
  }
};


// 3. Foydalanuvchi rolini o'zgartirish
export const updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const role = req.body.role;

    // ID to'g'riligini tekshirish
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "User ID noto'g'ri",
      });
    }

    // Admin o'z rolini o'zgartira olmaydi
    if (userId === req.user.id) {
      return res.status(400).json({
        message: "O'z rolingizni o'zgartira olmaysiz",
      });
    }

    // Foydalanuvchini topish
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Foydalanuvchi topilmadi",
      });
    }

    // Rolni yangilash
    user.role = role;

    await user.save();

    res.json({
      message: "Foydalanuvchi roli yangilandi",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};