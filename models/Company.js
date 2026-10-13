import mongoose from "mongoose";

export const companyStatuses = ["active", "prospect", "inactive"];

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    industry: { type: String, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    contactName: { type: String, trim: true, maxlength: 100 },
    contactEmail: { type: String, lowercase: true, trim: true, maxlength: 254 },
    contactPhone: { type: String, trim: true, maxlength: 20 },
    website: { type: String, trim: true, maxlength: 255 },
    status: {
      type: String,
      enum: companyStatuses,
      default: "prospect",
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

companySchema.index({ owner: 1, status: 1, updatedAt: -1 });
companySchema.index({ owner: 1, name: 1 });

const Company = mongoose.model("Company", companySchema);

export default Company;
