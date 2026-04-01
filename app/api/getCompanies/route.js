import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import { fetchWithCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchWithCache("dropdown_companies", 86400, async () => {
      await connectToDatabase();
      const companies = await Company.find({}).sort({ createdAt: -1 }).lean();
      return companies;
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
