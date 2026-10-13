import express from "express";
import { login, logout, refresh, register } from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { loginSchema, refreshSchema, registerSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);

export default router;
