import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import redis from "@/lib/redis";
import { companySlugFromName } from "@/lib/companySlug";
import { requireSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { safeExternalUrl } from "@/lib/utils";
import { jsonError } from "@/lib/api-response";

// The dropdown caches this list for a day; forgetting to clear it made a newly
// added company invisible for 24 hours.
const COMPANY_CACHE_KEY = "dropdown_companies_v2";

async function invalidateCompanyCache() {
    if (!redis) return;
    try {
        await redis.del(COMPANY_CACHE_KEY);
    } catch (err) {
        console.warn("[cache] company invalidation failed:", err?.message || err);
    }
}

/**
 * Editing an existing company rewrites a public page, so it is gated harder than
 * creation. Set ADMIN_EMAILS (comma separated) to restrict it; unset means any
 * signed-in user may edit.
 */
function isAdmin(email) {
    const allow = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return allow.length === 0 || allow.includes(email);
}

const text = (v, max) => String(v ?? "").trim().slice(0, max);

export async function GET(req) {
    try {
        await connectToDatabase();
        const slug = req.nextUrl.searchParams.get("slug");
        if (!slug) {
            return NextResponse.json({ success: false, error: "slug is required" }, { status: 400 });
        }
        const company = await Company.findOne({ slug }).lean();
        if (!company) {
            return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: { ...company, _id: String(company._id) } });
    } catch (error) {
        console.error("Error loading company:", error);
        return jsonError(error, "Unable to load company");
    }
}

export async function POST(req) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    const limited = await checkRateLimit(req, { key: "company-create", limit: 10, windowSeconds: 600 });
    if (limited) return limited;

    try {
        await connectToDatabase();

        const body = await req.json().catch(() => ({}));
        const name = text(body.name, 120);

        if (!name) {
            return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
        }

        const slug = companySlugFromName(name);
        if (!slug) {
            return NextResponse.json({ success: false, error: "Name must contain letters or digits" }, { status: 400 });
        }

        const existing = await Company.findOne({ slug });
        if (existing) {
            return NextResponse.json({ success: false, error: "Company already exists" }, { status: 409 });
        }

        const company = await Company.create({
            name,
            slug,
            about: text(body.about, 4000) || `Company ${name} interview experience details.`,
            website: safeExternalUrl(body.website) || "",
            logo: safeExternalUrl(body.logo) || "",
            location: text(body.location, 120),
            tags: Array.isArray(body.tags) ? body.tags.map((t) => text(t, 40)).filter(Boolean).slice(0, 10) : ["Interview"],
            stats: { interviewsCount: 0, reviewsCount: 0, rating: 5 },
        });

        await invalidateCompanyCache();

        const data = company.toObject ? { ...company.toObject(), _id: String(company._id) } : company;
        // `company` is kept alongside `data` for the AddCompanyModal caller.
        return NextResponse.json({ success: true, data, company: data }, { status: 201 });
    } catch (error) {
        console.error("Error creating company:", error);
        return jsonError(error, "Unable to create company");
    }
}

export async function PUT(req) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    if (!isAdmin(auth.email)) {
        return NextResponse.json({ success: false, error: "Not allowed" }, { status: 403 });
    }

    try {
        await connectToDatabase();
        const body = await req.json().catch(() => ({}));
        const currentSlug = text(body.currentSlug, 160);
        const name = text(body.name, 120);
        const about = text(body.about, 4000);

        if (!currentSlug || !name || !about) {
            return NextResponse.json(
                { success: false, error: "currentSlug, name and about are required" },
                { status: 400 }
            );
        }

        const nextSlug = companySlugFromName(name);
        const existing = await Company.findOne({ slug: currentSlug });
        if (!existing) {
            return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
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
                    website: safeExternalUrl(body.website) || "",
                    logo: safeExternalUrl(body.logo) || "",
                    location: text(body.location, 120),
                    tags: Array.isArray(body.tags) ? body.tags.map((t) => text(t, 40)).filter(Boolean).slice(0, 10) : [],
                },
            },
            { new: true }
        ).lean();

        await invalidateCompanyCache();

        return NextResponse.json({ success: true, data: updated ? { ...updated, _id: String(updated._id) } : null });
    } catch (error) {
        console.error("Error updating company:", error);
        return jsonError(error, "Unable to update company");
    }
}
