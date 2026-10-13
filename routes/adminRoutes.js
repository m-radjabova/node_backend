import express from "express";
import { getUserStats, listUsers, updateUserRole } from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { updateRoleSchema } from "../validators/adminValidator.js";

const router = express.Router();

router.use(authenticate, authorize("admin"));
router.get("/stats", getUserStats);
router.get("/users", listUsers);
router.patch("/users/:userId/role", validate(updateRoleSchema), updateUserRole);

export default router;
