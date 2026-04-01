import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import { companySlugFromName } from "@/lib/companySlug";

export async function GET(req) {
    try {
        await connectToDatabase();
        const slug = req.nextUrl.searchParams.get("slug");
        if (!slug) {
            return NextResponse.json(
                { success: false, error: "slug is required" },
                { status: 400 }
            );
        }
        const company = await Company.findOne({ slug }).lean();
        if (!company) {
            return NextResponse.json(
                { success: false, error: "Company not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: company });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

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

        const slug = companySlugFromName(name);

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

export async function PUT(req) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const {
            currentSlug,
            name,
            about,
            website = "",
            logo = "",
            location = "",
            tags = [],
        } = body;

        if (!currentSlug || !name || !about) {
            return NextResponse.json(
                { success: false, error: "currentSlug, name and about are required" },
                { status: 400 }
            );
        }

        const nextSlug = companySlugFromName(name);
        const existing = await Company.findOne({ slug: currentSlug });
        if (!existing) {
            return NextResponse.json(
                { success: false, error: "Company not found" },
                { status: 404 }
            );
        }

        if (nextSlug !== currentSlug) {
            const conflicting = await Company.findOne({ slug: nextSlug, _id: { $ne: existing._id } });
            if (conflicting) {
                return NextResponse.json(
                    { success: false, error: "Another company already uses this name" },
                    { status: 409 }
                );
            }
        }

        const updated = await Company.findOneAndUpdate(
            { _id: existing._id },
            {
                $set: {
                    name,
                    slug: nextSlug,
                    about,
                    website,
                    logo,
                    location,
                    tags: Array.isArray(tags) ? tags : [],
                },
            },
            { new: true }
        ).lean();

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}