import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    group: {
      type: String,
      required: true,
    },

    subjects: [
      {
        subjectName: {
          type: String,
          required: true,
        },

        grade: {
          type: Number,
          required: true,
          min: 0,
          max: 5,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", StudentSchema);

export default Student;