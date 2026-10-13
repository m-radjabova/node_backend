import express from "express";
import { getMyReport } from "../controllers/reportController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", authenticate, authorize("manager"), getMyReport);
export default router;
