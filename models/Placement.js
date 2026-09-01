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
    // Repeat drives are printed as 4.a / 4.b (or 3 (a)) under one Sr. No., so the
    // number alone is not unique within a group.
    variant: { type: String, default: "", trim: true },

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

    // Reports before 2022-23 split CE and E&TC by shift. ce/entc above are the
    // totals; this preserves the original breakdown rather than discarding it.
    shifts: {
      ce1: Number, ce2: Number, entc1: Number, entc2: Number,
    },

    // Per-row source defects, recorded rather than rejected at seed time.
    // genderMismatch: male + female != total (seven 2023-24 rows).
    // branchMismatch: branch counts do not sum to total (2017-18, 2021-22).
    // salaryBand: the report printed a range ("5.5-7.5"); lpa is totalLpa/total.
    genderMismatch: { type: Boolean, default: false },
    branchMismatch: { type: Boolean, default: false },
    salaryBand: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Natural key for the seeder's upsert. `group` is in it because 2025-26 restarts
// numbering at 1 for Group II -- keying on { year, sr } alone let those four rows
// overwrite Group I rows 1-4. `variant` is in it because older reports print
// repeat drives as 4.a / 4.b under a single Sr. No.
PlacementSchema.index({ year: 1, group: 1, sr: 1, variant: 1 }, { unique: true });
PlacementSchema.index({ year: 1, lpa: -1 });

export default mongoose.models.Placement || mongoose.model("Placement", PlacementSchema);
