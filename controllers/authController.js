import User from "../models/User.js";
import { decodeToken, hashPassword, verifyPassword } from "../utils/security.js";

import {
  findRefreshToken,
  issueTokens,
  removeRefreshToken,
} from "../utils/tokens.js";


// 1. REGISTER
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).json({
        message: "Bu email manzil bilan hisob allaqachon mavjud",
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: role === "manager" ? "manager" : "user",
    });

    const tokenUser = await User.findById(user._id)
      .select("+refreshTokens");

    const tokens = await issueTokens(tokenUser);

    res.set("x-auth-token", tokens.accessToken).status(201).json({
      message: "Ro'yxatdan o'tdingiz",
      user: getUserData(user),
      tokens,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Bu email manzil bilan hisob allaqachon mavjud",
      });
    }
    next(error);
  }
};


// 2. LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+passwordHash +refreshTokens");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    const tokens = await issueTokens(user);

    res.set("x-auth-token", tokens.accessToken).json({
      message: "Tizimga kirdingiz",
      user: getUserData(user),
      tokens,
    });

  } catch (error) {
    next(error);
  }
};


// 3. REFRESH TOKEN
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const decoded = decodeToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.sub)
      .select("+refreshTokens");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Ruxsat yo'q" });
    }

    const exists = await findRefreshToken(user, refreshToken);

    if (!exists) {
      return res.status(401).json({ message: "Token xato" });
    }

    await removeRefreshToken(user, refreshToken);

    const tokens = await issueTokens(user);

    res.json({ tokens });

  } catch (error) {
    res.status(401).json({ message: "Token xato yoki muddati tugagan" });
  }
};


// 4. LOGOUT
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    try {
      const decoded = decodeToken(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await User.findById(decoded.sub)
        .select("+refreshTokens");

      if (user) {
        await removeRefreshToken(user, refreshToken);
      }
    } catch (error) {
      // Token xato bo'lsa ham chiqishga ruxsat
    }

    res.status(204).send();

  } catch (error) {
    next(error);
  }
};


// USER MA'LUMOTLARINI QAYTARISH
const getUserData = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone || null,
  jobTitle: user.jobTitle || null,
  company: user.company || null,
  language: user.language || null,
  role: user.role,
  createdAt: user.createdAt,
});
