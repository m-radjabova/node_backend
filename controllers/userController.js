
import bcrypt from "bcrypt";
import User from "../models/User.js";


// 1. PROFIL MA'LUMOTLARINI OLISH
export const getMe = (req, res) => {
  const user = req.user;

  return res.status(200).json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || null,
      jobTitle: user.jobTitle || null,
      company: user.company || null,
      language: user.language || null,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};


// 2. PROFILNI YANGILASH
export const updateMe = async (req, res, next) => {
  try {
    const user = req.user;

    // Frontenddan ma'lumotlarni olish
    const {
      fullName,
      email,
      phone,
      jobTitle,
      company,
      language,
    } = req.body;

    // Faqat ruxsat etilgan maydonlarni yangilash
    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (jobTitle !== undefined) {
      user.jobTitle = jobTitle;
    }

    if (company !== undefined) {
      user.company = company;
    }

    if (language !== undefined) {
      user.language = language;
    }

    // O'zgarishlarni bazaga saqlash
    await user.save();

    return res.status(200).json({
      message: "Profil yangilandi",

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || null,
        jobTitle: user.jobTitle || null,
        company: user.company || null,
        language: user.language || null,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    // Email yoki telefon band bo'lsa
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email yoki telefon raqami band",
      });
    }

    next(error);
  }
};


// 3. PAROLNI O'ZGARTIRISH
export const changePassword = async (req, res, next) => {
  try {
    // Frontenddan parollarni olish
    const { currentPassword, newPassword } = req.body;

    // Parollar yuborilganini tekshirish
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        message: "Joriy parolni va kamida 8 belgili yangi parolni kiriting",
      });
    }

    // Foydalanuvchini bazadan topish
    const user = await User.findById(req.user._id)
      .select("+passwordHash +refreshTokens");

    // Foydalanuvchi topilmasa
    if (!user) {
      return res.status(404).json({
        message: "Foydalanuvchi topilmadi",
      });
    }

    // Joriy parolni tekshirish
    const isCorrect = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCorrect) {
      return res.status(400).json({
        message: "Joriy parol noto'g'ri",
      });
    }

    // Yangi parolni hash qilish
    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    // Yangi parolni saqlash
    user.passwordHash = hashedPassword;

    // Barcha refresh tokenlarni o'chirish
    user.refreshTokens = [];

    await user.save();

    return res.status(200).json({
      message: "Parol yangilandi. Barcha qurilmalarda qayta kiring.",
    });

  } catch (error) {
    next(error);
  }
};
