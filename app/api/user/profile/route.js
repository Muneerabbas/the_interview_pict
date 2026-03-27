import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongoose";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const user = await User.findOne({ gmail: email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { headline, about, skills, socialLinks, name, profile_pic, college, branch, batch, role, currentCompany } = body;

        await connectToDatabase();

        // Use user's email from session to ensure security
        const userEmail = session.user.email;

        const updateData = {};
        if (headline !== undefined) updateData.headline = headline;
        if (about !== undefined) updateData.about = about;
        if (skills !== undefined) updateData.skills = skills;
        if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
        if (name !== undefined) updateData.name = name;
        if (profile_pic !== undefined) updateData.profile_pic = profile_pic;
        if (college !== undefined) updateData.college = college;
        if (branch !== undefined) updateData.branch = branch;
        if (batch !== undefined) updateData.batch = batch;
        if (role !== undefined) updateData.role = role;
        if (currentCompany !== undefined) updateData.currentCompany = currentCompany;

        const user = await User.findOneAndUpdate(
            { gmail: userEmail },
            { $set: updateData },
            { new: true, upsert: true }
        );

        return NextResponse.json({ message: "Profile updated successfully", user }, { status: 200 });
    } catch (error) {
        console.error("Profile POST error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
