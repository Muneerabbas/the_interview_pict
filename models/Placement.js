import mongoose from "mongoose";

/**
 * One document per recruiting *drive*, not per company: 2025-26 has 110 drives
 * across 100 employers, because nine of them recruited more than once at
 * different packages (Flextrade three times, Amazon twice, and so on). Keying on
 * the company would silently collapse those.
 */
const PlacementSchema = new mongoose.Schema(
  {
    // Present from day one so 2026-27 is an insert rather than a migration.
    year: { type: String, required: true, trim: true },
    sr: { type: Number, required: true }, // row number in the source report

    company: { type: String, required: true, trim: true },
    // companySlugFromName(). Company.slug is unique, Company.name is not, so the
    // slug is the only safe key if these are ever joined to the company pages.
    slug: { type: String, required: true, trim: true },
    group: { type: String, enum: ["I", "II"], required: true },

    ce: { type: Number, default: 0 },
    entc: { type: Number, default: 0 },
    it: { type: Number, default: 0 },
    mce: { type: Number, default: 0 },
    metc: { type: Number, default: 0 },
    mds: { type: Number, default: 0 },

    male: { type: Number, default: 0 },
    female: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    lpa: { type: Number, default: 0 },
    totalLpa: { type: Number, default: 0 },

    // These three mirror what the report *printed*, blanks included. Branch
    // averages are computed from count x lpa instead, which is why the page can
    // show a corrected CE/IT average alongside the printed one.
    ceLpa: { type: Number, default: 0 },
    entcLpa: { type: Number, default: 0 },
    itLpa: { type: Number, default: 0 },

    // Row 106 (SLB) ships blank per-branch salary cells. Recorded as data so the
    // UI can explain the discrepancy instead of hardcoding a company name.
    sourceIncomplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Natural key for the seeder's upsert. `group` is part of it because the report
// restarts numbering at 1 for Group II -- keying on { year, sr } alone let the
// four Group II rows overwrite Group I rows 1-4.
PlacementSchema.index({ year: 1, group: 1, sr: 1 }, { unique: true });
PlacementSchema.index({ year: 1, lpa: -1 });

export default mongoose.models.Placement || mongoose.model("Placement", PlacementSchema);
