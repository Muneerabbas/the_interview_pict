import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    stateCodes: { type: [String], default: [] },
  },
  { timestamps: true }
);

CollegeSchema.index({ name: 1 });

export default mongoose.models.College ||
  mongoose.model("College", CollegeSchema);
