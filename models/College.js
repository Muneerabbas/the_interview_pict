import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    stateCodes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.College ||
  mongoose.model("College", CollegeSchema);
