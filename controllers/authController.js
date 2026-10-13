
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  findRefreshToken,
  issueTokens,
  removeRefreshToken,
} from "../utils/tokens.js";


// 1. RO'YXATDAN O'TISH
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Email oldin ro'yxatdan o'tganmi?
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).json({
        message: "Bu email allaqachon ro'yxatdan o'tgan",
      });
    }
    // Parolni shifrlash (hashlash)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Yangi foydalanuvchi yaratish
    const user = await User.create({
      fullName,
      email,
      passwordHash: hashedPassword,
      role: role === "manager" ? "manager" : "user",
    });

    // Token yaratish uchun refreshTokens maydonini olish
    const tokenUser = await User.findById(user._id)
      .select("+refreshTokens");

    const tokens = await issueTokens(tokenUser);

    // Frontend JSON'dagi tokens orqali ishlashda davom etadi; shu bilan birga
    // klassik API mijozlari tokenni x-auth-token headeridan ham olishi mumkin.
    res.set("x-auth-token", tokens.accessToken).status(201).json({
      message: "Ro'yxatdan o'tish muvaffaqiyatli",
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
      },
      tokens,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Bu qiymat boshqa foydalanuvchida band",
      });
    }

    next(error);
  }
};


// 2. TIZIMGA KIRISH
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Email orqali foydalanuvchini topish
    const user = await User.findOne({ email })
      .select("+passwordHash +refreshTokens");

    // Foydalanuvchi mavjud emas
    if (!user) {
      return res.status(401).json({
        message: "Email yoki parol noto'g'ri",
      });
    }

    // Foydalanuvchi faol emas
    if (!user.isActive) {
      return res.status(401).json({
        message: "Email yoki parol noto'g'ri",
      });
    }

    // Parolni tekshirish
    const correctPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!correctPassword) {
      return res.status(401).json({
        message: "Email yoki parol noto'g'ri",
      });
    }

    // Token yaratish
    const tokens = await issueTokens(user);

    res.set("x-auth-token", tokens.accessToken).json({
      message: "Kirish muvaffaqiyatli",
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
      },
      tokens,
    });

  } catch (error) {
    next(error);
  }
};


// 3. TOKENNI YANGILASH
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Tokenni tekshirish
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // Token ichidagi ID orqali userni topish
    const user = await User.findById(payload.sub)
      .select("+refreshTokens");

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Foydalanuvchi topilmadi yoki faol emas",
      });
    }

    // Token bazada mavjudligini tekshirish
    const tokenExists = await findRefreshToken(
      user,
      refreshToken
    );

    if (!tokenExists) {
      return res.status(401).json({
        message: "Refresh token noto'g'ri",
      });
    }

    // Eski tokenni o'chirish
    await removeRefreshToken(user, refreshToken);

    // Yangi token yaratish
    const tokens = await issueTokens(user);

    res.json({ tokens });

  } catch (error) {
    return res.status(401).json({
      message: "Refresh token noto'g'ri yoki muddati tugagan",
    });
  }
};


// 4. TIZIMDAN CHIQISH
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Tokenni tekshirish
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      // Foydalanuvchini topish
      const user = await User.findById(payload.sub)
        .select("+refreshTokens");

      // Tokenni bazadan o'chirish
      if (user) {
        await removeRefreshToken(user, refreshToken);
      }

    } catch (error) {
      // Token yaroqsiz bo'lsa ham logout muvaffaqiyatli
    }

    res.status(204).send();

  } catch (error) {
    next(error);
  }
};
