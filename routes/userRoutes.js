import express from "express";
import { getMe, updateMe, changePassword } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { changePasswordSchema, updateProfileSchema } from "../validators/userValidator.js";

const router = express.Router();

router.use(authenticate);
router.get("/me", getMe);
router.patch("/me", validate(updateProfileSchema), updateMe);
router.patch("/me/password", validate(changePasswordSchema), changePassword);

export default router;
