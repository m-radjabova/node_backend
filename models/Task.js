import mongoose from "mongoose";

export const taskStatuses = ["todo", "in_progress", "done"];
export const taskPriorities = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: taskStatuses, default: "todo", index: true },
    priority: { type: String, enum: taskPriorities, default: "medium" },
    dueAt: { type: Date, required: true, index: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_document, result) => {
        result.id = result._id.toString();
        delete result._id;
        return result;
      },
    },
  },
);

taskSchema.index({ owner: 1, status: 1, dueAt: 1 });
export default mongoose.model("Task", taskSchema);
