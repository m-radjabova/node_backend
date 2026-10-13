import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI .env faylida berilmagan");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB ulandi ✅");
};

export default connectDB;
