import express from "express";
import { createTask, deleteTask, listTasks, updateTask } from "../controllers/taskController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createTaskSchema, updateTaskSchema } from "../validators/taskValidator.js";

const router = express.Router();
router.use(authenticate, authorize("manager"));
router.get("/", listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.patch("/:taskId", validate(updateTaskSchema), updateTask);
router.delete("/:taskId", deleteTask);
export default router;
