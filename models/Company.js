import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        about: { type: String, required: true },

        website: String,
        logo: String,
        location: String,

        tags: [String],

        stats: {
            interviewsCount: { type: Number, default: 0 },
            reviewsCount: { type: Number, default: 0 },
            rating: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

export default mongoose.models.Company ||
    mongoose.model("Company", CompanySchema);