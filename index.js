import "dotenv/config";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import ensureDefaultAdmin from "./config/admin.js";
import { assertJwtConfig } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ exposedHeaders: ["x-auth-token"] }));
app.use(express.json());

const healthResponse = (_req, res) =>
  res.json({ status: "ok", service: "CRM API" });

// Render standart health check uchun ildiz manzilga so'rov yuborishi mumkin.
// Shu sabab `/` ham, aniq health endpoint ham muvaffaqiyatli javob qaytaradi.
app.get("/", healthResponse);
app.get("/health", healthResponse);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/leads", leadRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/companies", companyRoutes);
app.use("/reports", reportRoutes);
app.use("/calendar", calendarRoutes);
app.use("/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    assertJwtConfig();
    await connectDB();
    await ensureDefaultAdmin();
    app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlayapti 🚀`));
  } catch (error) {
    console.error(`Server ishga tushmadi: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
