import express from "express";
import { listMyEvents } from "../controllers/calendarController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(authenticate, authorize("manager"));
router.get("/events", listMyEvents);
export default router;
