import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { assertJwtConfig } from "../config/env.js";

const BCRYPT_ROUNDS = 12;

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

export const verifyPassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

export const createToken = (payload, { secret, expiresIn }) => {
  assertJwtConfig();
  return jwt.sign(payload, secret, { expiresIn });
};

export const decodeToken = (token, secret) => {
  assertJwtConfig();
  return jwt.verify(token, secret);
};
