import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";

export async function POST(req) {
    try {
        await connectToDatabase();

        const body = await req.json();

        const { name, about, website, logo, location, tags = [] } = body;

        // ✅ validation
        if (!name || !about) {
            return NextResponse.json(
                { success: false, error: "Name and about are required" },
                { status: 400 }
            );
        }

        // ✅ slug
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        // ✅ check duplicate
        const existing = await Company.findOne({ slug });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "Company already exists" },
                { status: 409 }
            );
        }

        const company = await Company.create({
            name,
            slug,
            about,
            website,
            logo,
            location,
            tags
        });

        return NextResponse.json({ success: true, data: company });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}