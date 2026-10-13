import express from "express";
import {
  createCompany,
  deleteMyCompany,
  getMyCompany,
  listMyCompanies,
  updateMyCompany,
} from "../controllers/companyController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createCompanySchema, updateCompanySchema } from "../validators/companyValidator.js";

const router = express.Router();

router.use(authenticate, authorize("manager"));
router.post("/", validate(createCompanySchema), createCompany);
router.get("/", listMyCompanies);
router.get("/:companyId", getMyCompany);
router.patch("/:companyId", validate(updateCompanySchema), updateMyCompany);
router.delete("/:companyId", deleteMyCompany);

export default router;
