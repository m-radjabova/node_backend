import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB ulandi ✅");
  } catch (error) {
    console.log("MongoDB ulanishda xatolik ❌");
    console.log(error.message);
  }
};

export default connectDB;