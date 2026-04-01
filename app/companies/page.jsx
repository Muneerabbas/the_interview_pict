import React from "react";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import CompaniesDirectoryClient from "@/components/CompaniesDirectoryClient";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function CompaniesDirectory() {
    await connectToDatabase();
    const db = mongoose.connection.db;
    const expCol = db.collection("experience");

    const [companies, stats] = await Promise.all([
        Company.find({})
            .select("name slug about logo location tags createdAt")
            .sort({ createdAt: -1 })
            .lean(),
        expCol
            .aggregate([
                { $match: { company: { $type: "string", $ne: "" } } },
                { $group: { _id: { $toLower: "$company" }, count: { $sum: 1 } } }
            ])
            .toArray(),
    ]);

    const countsMap = {};
    stats.forEach((s) => {
        if (s._id) countsMap[s._id] = s.count;
    });

    const serializedCompanies = companies.map((company) => ({
        _id: company?._id?.toString?.() || "",
        name: company?.name || "",
        slug: company?.slug || "",
        about: company?.about || "",
        logo: company?.logo || "",
        location: company?.location || "",
        tags: Array.isArray(company?.tags) ? company.tags : [],
    }));

    return <CompaniesDirectoryClient companies={serializedCompanies} countsMap={countsMap} />;
}
