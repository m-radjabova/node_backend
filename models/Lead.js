import mongoose from "mongoose";

export const leadStatuses = ["new", "in_progress", "proposal", "won", "lost"];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    value: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: leadStatuses, default: "new", index: true },
    contactName: { type: String, trim: true, maxlength: 100 },
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    nextActionAt: { type: Date, index: true },
    nextActionType: { type: String, enum: ["call", "meeting", "follow_up"], default: "follow_up" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    timestamps: true,
    // Client ilovasi barcha resurslar uchun `id` ishlatadi. MongoDB esa
    // standart bo'yicha `_id` qaytaradi, shuning uchun API chegarasida
    // bitta, izchil formatga o'tkazamiz.
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, result) => {
        result.id = result._id.toString();
        delete result._id;
        return result;
      },
    },
  },
);

leadSchema.index({ owner: 1, status: 1 });
leadSchema.index({ owner: 1, nextActionAt: 1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
