import React from "react";
import CompaniesDirectoryClient from "@/components/CompaniesDirectoryClient";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Companies",
    description:
        "Browse companies and read real interview experiences, hiring insights, and preparation tips.",
    alternates: {
        canonical: "/companies",
    },
    openGraph: {
        title: "Companies | The Interview Room",
        description:
            "Browse companies and read real interview experiences, hiring insights, and preparation tips.",
        url: "https://theinterviewroom.in/companies",
    },
};

export default async function CompaniesDirectory() {
    const db = await getMongoDb({ mode: "read" });
    const expCol = db.collection("experience");

    const [companies, stats] = await Promise.all([
        db.collection("companies")
            .find({}, { projection: { name: 1, slug: 1, about: 1, logo: 1, location: 1, tags: 1 } })
            .sort({ createdAt: -1 })
            .limit(2000)
            .toArray(),
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
