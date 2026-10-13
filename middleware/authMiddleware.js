
import jwt from "jsonwebtoken";
import User from "../models/User.js";


// 1. FOYDALANUVCHINI TEKSHIRISH
export const authenticate = async (req, res, next) => {
  try {
    // Frontenddan tokenni olish
    const authorization = req.headers.authorization;

    // Token yuborilmagan bo'lsa
    if (!authorization) {
      return res.status(401).json({
        message: "Access token talab qilinadi",
      });
    }

    // Bearer va tokenni ajratish
    const [type, token] = authorization.split(" ");

    // Token formatini tekshirish
    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Bearer access token talab qilinadi",
      });
    }

    // Tokenni tekshirish
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    // Token ichidagi ID orqali userni topish
    const user = await User.findById(payload.sub);

    // User mavjud bo'lmasa
    if (!user) {
      return res.status(401).json({
        message: "Foydalanuvchi topilmadi",
      });
    }

    // User faol bo'lmasa
    if (!user.isActive) {
      return res.status(401).json({
        message: "Foydalanuvchi faol emas",
      });
    }

    // Userni req ga qo'shish
    req.user = user;

    // Keyingi middleware yoki controllerga o'tish
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Access token noto'g'ri yoki muddati tugagan",
    });
  }
};


// 2. FOYDALANUVCHI ROLINI TEKSHIRISH
export const authorize = (...roles) => {
  return (req, res, next) => {

    // Foydalanuvchi roli ruxsat etilganmi?
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bu amal uchun ruxsat yo'q",
      });
    }

    // Ruxsat bo'lsa davom etish
    next();
  };
};
