import express from "express";
import { getManagerDashboard } from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/manager", authenticate, authorize("manager"), getManagerDashboard);
export default router;
