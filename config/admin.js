import bcrypt from "bcrypt";
import User from "../models/User.js";

const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || "CRM Administrator";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL va ADMIN_PASSWORD .env faylida berilmagan");
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
    }
    return;
  }

  await User.create({
    fullName,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
  });
  console.log(`Default admin yaratildi: ${email}`);
};

export default ensureDefaultAdmin;
