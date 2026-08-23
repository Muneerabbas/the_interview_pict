import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongoose";
import { fetchWithCache } from "@/lib/cache";
import redis from "@/lib/redis";
import { requireSession, normalizeEmail } from "@/lib/auth";
import { safeExternalUrl } from "@/lib/utils";
import { jsonError } from "@/lib/api-response";

// Fields safe to expose on a public profile. Returning the whole document leaked
// notification state and allowed email enumeration.
const PUBLIC_FIELDS =
    "gmail name image profile_pic headline about skills socialLinks college branch batch role currentCompany views";

const SOCIAL_KEYS = ["linkedin", "twitter", "facebook", "leetcode", "codeforces", "codechef", "youtube", "instagram"];

function sanitizeSocialLinks(input) {
    if (!input || typeof input !== "object") return undefined;

    const clean = {};
    for (const key of SOCIAL_KEYS) {
        const url = safeExternalUrl(input[key]);
        clean[key] = url || "";
    }

    clean.custom = Array.isArray(input.custom)
        ? input.custom
              .map((link) => ({
                  name: String(link?.name ?? "").trim().slice(0, 40),
                  url: safeExternalUrl(link?.url) || "",
              }))
              .filter((link) => link.name || link.url)
              .slice(0, 10)
        : [];

    return clean;
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = normalizeEmail(searchParams.get("email"));

    if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    try {
        await connectToDatabase();

        const cacheKey = `user_profile_data:${email}`;
        // .lean() so a cache hit and a fresh read return the same shape.
        const user = await fetchWithCache(cacheKey, 3600, async () => {
            const doc = await User.findOne({ gmail: email }).select(PUBLIC_FIELDS).lean();
            return doc ? { ...doc, _id: String(doc._id) } : null;
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Profile GET error:", error);
        return jsonError(error, "Unable to load profile");
    }
}

export async function POST(req) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    try {
        const body = await req.json().catch(() => ({}));
        const { headline, about, skills, socialLinks, name, profile_pic, college, branch, batch, role, currentCompany } = body;

        await connectToDatabase();

        const userEmail = auth.email;
        const updateData = {};

        const text = (v, max) => String(v ?? "").trim().slice(0, max);

        if (headline !== undefined) updateData.headline = text(headline, 160);
        if (about !== undefined) updateData.about = text(about, 2000);
        if (name !== undefined) updateData.name = text(name, 80);
        if (college !== undefined) updateData.college = text(college, 120);
        if (branch !== undefined) updateData.branch = text(branch, 80);
        if (batch !== undefined) updateData.batch = text(batch, 20);
        if (role !== undefined) updateData.role = text(role, 80);
        if (currentCompany !== undefined) updateData.currentCompany = text(currentCompany, 80);
        if (profile_pic !== undefined) updateData.profile_pic = safeExternalUrl(profile_pic) || "";

        if (skills !== undefined) {
            updateData.skills = Array.isArray(skills)
                ? [...new Set(skills.map((s) => text(s, 40)).filter(Boolean))].slice(0, 30)
                : [];
        }

        const cleanSocial = sanitizeSocialLinks(socialLinks);
        if (cleanSocial) updateData.socialLinks = cleanSocial;

        // `name` is required by the schema, so guarantee it on the upsert path.
        // It must live in $set (not $setOnInsert) or Mongo rejects the conflicting path.
        if (!updateData.name) updateData.name = auth.name || userEmail.split("@")[0];

        const user = await User.findOneAndUpdate(
            { gmail: userEmail },
            { $set: updateData, $setOnInsert: { gmail: userEmail } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
            .select(PUBLIC_FIELDS)
            .lean();

        if (redis) {
            try {
                await redis.del([`user_profile_data:${userEmail}`, `public_profile_full_v2:${userEmail}`]);
            } catch (err) {
                console.warn("[cache] profile invalidation failed:", err?.message || err);
            }
        }

        return NextResponse.json(
            { message: "Profile updated successfully", user: user ? { ...user, _id: String(user._id) } : null },
            { status: 200 }
        );
    } catch (error) {
        console.error("Profile POST error:", error);
        return jsonError(error, "Unable to update profile");
    }
}
