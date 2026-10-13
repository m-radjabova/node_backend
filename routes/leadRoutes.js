import express from "express";
import {
  createLead,
  deleteMyLead,
  getMyLead,
  listMyLeads,
  myLeadsBoard,
  updateMyLead,
  updateMyLeadStatus,
} from "../controllers/leadController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createLeadSchema, updateLeadSchema, updateLeadStatusSchema } from "../validators/leadValidator.js";

const router = express.Router();

router.use(authenticate, authorize("manager"));
router.post("/", validate(createLeadSchema), createLead);
router.get("/", listMyLeads);
router.get("/board", myLeadsBoard);
router.get("/:leadId", getMyLead);
router.patch("/:leadId", validate(updateLeadSchema), updateMyLead);
router.patch("/:leadId/status", validate(updateLeadStatusSchema), updateMyLeadStatus);
router.delete("/:leadId", deleteMyLead);

export default router;
