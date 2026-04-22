import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import College from "@/models/College";

export const dynamic = "force-dynamic";

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const rawPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = Number.parseInt(searchParams.get("limit") || "20", 10);

    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, 50)
      : 20;

    const filter = q
      ? { name: { $regex: escapeRegex(q), $options: "i" } }
      : {};

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      College.find(filter, { _id: 0, name: 1 })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      College.countDocuments(filter),
    ]);

    const data = items.map((college) => college.name);
    const hasMore = skip + items.length < total;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
      query: q,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
