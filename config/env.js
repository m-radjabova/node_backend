const required = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

export const assertJwtConfig = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length)
    throw new Error(`${missing.join(", ")} .env faylida berilmagan`);
};

export const accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
export const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
