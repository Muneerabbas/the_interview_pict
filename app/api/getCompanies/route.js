import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";

export async function GET() {
  try {
    await connectToDatabase();

    const companies = await Company.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: companies
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}