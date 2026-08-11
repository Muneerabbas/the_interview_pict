import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import { fetchWithCache } from "@/lib/cache";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchWithCache("dropdown_companies_v2", 86400, async () => {
      await connectToDatabase();
      const companies = await Company.find({}, { _id: 0, name: 1, slug: 1 })
        .sort({ name: 1 })
        .limit(2000)
        .lean();
      return companies.map(({ name, slug }) => ({ name, slug }));
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching companies:", error?.message || error);
    return jsonError(error, "Unable to load companies");
  }
}
