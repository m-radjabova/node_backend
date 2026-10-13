
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  assertJwtConfig,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
} from "../config/env.js";


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
  // JWT sozlamalarini tekshirish
  assertJwtConfig();

  const accessToken = jwt.sign(
    {
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: accessTokenExpiresIn,
    }
  );

  return accessToken;
};


// 3. REFRESH TOKEN YARATISH
export const createRefreshToken = (user) => {
  assertJwtConfig();

  const refreshToken = jwt.sign(
    {},
    process.env.JWT_REFRESH_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: refreshTokenExpiresIn,
    }
  );

  return refreshToken;
};


// 4. REFRESH TOKENNI BAZAGA SAQLASH
export const addRefreshToken = async (user, refreshToken) => {
  // Tokenni hash qilish
  const tokenHash = await bcrypt.hash(refreshToken, 12);

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
      const isMatch = await bcrypt.compare(
        refreshToken,
        item.tokenHash
      );

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
    const isMatch = await bcrypt.compare(
      refreshToken,
      item.tokenHash
    );

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
