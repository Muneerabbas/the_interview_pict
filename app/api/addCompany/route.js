import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import slugify from "slugify";
import redis from "@/lib/redis";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, about, logo, location, website, tags } = body;

        if (!name) {
            return NextResponse.json({ success: false, message: "Company name is required text" }, { status: 400 });
        }

        await connectToDatabase();

        const slug = slugify(name, { lower: true, strict: true });

        // Check if company exists
        const existingCompany = await Company.findOne({ slug });
        if (existingCompany) {
            return NextResponse.json({ success: false, message: "Company already exists" }, { status: 409 });
        }

        const newCompany = await Company.create({
            name,
            slug,
            about: about || `Company ${name} interview experience details.`,
            logo: logo || "",
            location: location || "",
            website: website || "",
            tags: tags || ["Interview"],
            stats: {
                interviewsCount: 0,
                reviewsCount: 0,
                rating: 5
            }
        });

        if (redis) {
            await redis.del("dropdown_companies").catch(() => { });
        }

        return NextResponse.json({ success: true, company: newCompany });
    } catch (error) {
        console.error("Error creating company:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
