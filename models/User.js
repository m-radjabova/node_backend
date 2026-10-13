import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    jobTitle: { type: String, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100 },
    language: { type: String, enum: ["uz", "ru", "en"] },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
      required: true,
    },
    passwordHash: { type: String, required: true, select: false },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
