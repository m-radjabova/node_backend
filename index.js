import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import bookRoutes from "./routes/bookRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB ulandi ✅"))
  .catch((error) => console.log(error));

app.use("/books", bookRoutes);
app.use("/students", studentRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlayapti 🚀`);
});
