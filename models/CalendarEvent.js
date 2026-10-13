import mongoose from "mongoose";

export const eventColors = ["blue", "purple", "emerald", "amber", "rose"];

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 1000 },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    color: { type: String, enum: eventColors, default: "blue" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);
calendarEventSchema.index({ owner: 1, start: 1, end: 1 });
export default mongoose.model("CalendarEvent", calendarEventSchema);
