
import { accessTokenExpiresIn, refreshTokenExpiresIn } from "../config/env.js";
import {
  createToken,
  hashPassword,
  verifyPassword,
} from "./security.js";


// 1. TOKEN TUGASH SANASINI HISOBLASH
const getExpiryDate = (expiresIn) => {
  // Masalan: "7d", "15m", "2h"
  const match = /^(\d+)([smhd])$/.exec(expiresIn);

  if (!match) {
    throw new Error("Token muddati noto'g'ri formatda");
  }

  const number = Number(match[1]);
  const unit = match[2];

  let seconds = 0;

  if (unit === "s") {
    seconds = number;
  } else if (unit === "m") {
    seconds = number * 60;
  } else if (unit === "h") {
    seconds = number * 60 * 60;
  } else if (unit === "d") {
    seconds = number * 24 * 60 * 60;
  }

  return new Date(Date.now() + seconds * 1000);
};


// 2. ACCESS TOKEN YARATISH
export const createAccessToken = (user) => {
  return createToken(
    { sub: user._id.toString(), role: user.role },
    {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: accessTokenExpiresIn,
    },
  );
};


// 3. REFRESH TOKEN YARATISH
export const createRefreshToken = (user) => {
  return createToken(
    { sub: user._id.toString() },
    {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: refreshTokenExpiresIn,
    },
  );
};


// 4. REFRESH TOKENNI BAZAGA SAQLASH
export const addRefreshToken = async (user, refreshToken) => {
  // Tokenni hash qilish
  const tokenHash = await hashPassword(refreshToken);

  const now = new Date();

  // Muddati tugamagan tokenlarni saqlash
  const validTokens = [];

  for (const item of user.refreshTokens) {
    if (item.expiresAt > now) {
      validTokens.push(item);
    }
  }

  // Oxirgi 4 ta tokenni qoldirish
  user.refreshTokens = validTokens.slice(-4);

  // Yangi tokenni qo'shish
  user.refreshTokens.push({
    tokenHash: tokenHash,
    expiresAt: getExpiryDate(refreshTokenExpiresIn),
  });

  // MongoDB ga saqlash
  await user.save();
};


// 5. REFRESH TOKENNI TOPISH
export const findRefreshToken = async (user, refreshToken) => {
  const now = new Date();

  for (const item of user.refreshTokens) {
    // Token muddati tugamagan bo'lsa
    if (item.expiresAt > now) {
      // Tokenni tekshirish
      const isMatch = await verifyPassword(refreshToken, item.tokenHash);

      if (isMatch) {
        return item;
      }
    }
  }

  // Token topilmasa
  return null;
};


// 6. REFRESH TOKENNI O'CHIRISH
export const removeRefreshToken = async (user, refreshToken) => {
  const remainingTokens = [];

  for (const item of user.refreshTokens) {
    const isMatch = await verifyPassword(refreshToken, item.tokenHash);

    // Mos kelmagan tokenlarni qoldirish
    if (!isMatch) {
      remainingTokens.push(item);
    }
  }

  // Qolgan tokenlarni saqlash
  user.refreshTokens = remainingTokens;

  await user.save();
};


// 7. IKKALA TOKENNI YARATISH
export const issueTokens = async (user) => {
  // Access token yaratish
  const accessToken = createAccessToken(user);

  // Refresh token yaratish
  const refreshToken = createRefreshToken(user);

  // Refresh tokenni bazaga saqlash
  await addRefreshToken(user, refreshToken);

  // Frontendga qaytarish
  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
  };
};
