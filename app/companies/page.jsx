import React from "react";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import { ArrowRight, Building2, Globe, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { MongoClient } from "mongodb";
import Image from "next/image";

// Ensure this page fetches freshly or ISR.
export const dynamic = "force-dynamic";

export default async function CompaniesDirectory() {
    await connectToDatabase();
    const client = new MongoClient(process.env.MONGODB_URI);

    // Fetch companies sorted by most recently created
    const companies = await Company.find({}).sort({ createdAt: -1 }).lean();

    const db = client.db("int-exp");
    const expCol = db.collection("experience");
    
    // Dynamically calculate interviews per company
    const stats = await expCol.aggregate([
        { $group: { _id: { $toLower: "$company" }, count: { $sum: 1 } } }
    ]).toArray();

    const countsMap = {};
    stats.forEach(s => {
        if (s._id) countsMap[s._id] = s.count;
    });

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight flex items-center justify-center sm:justify-start gap-3">
                            <Building2 className="text-blue-600" size={36} />
                            Company Directory
                        </h1>
                        <p className="mt-3 text-slate-600 max-w-2xl text-lg">
                            Explore the companies where candidates have interviewed and prepare for your next opportunity.
                        </p>
                    </div>
                    <Link
                        href="/add-company"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-lg active:scale-95"
                    >
                        Add Company
                    </Link>
                </div>

                {companies.length === 0 ? (
                    <div className="flex flex-col h-64 items-center justify-center rounded-3xl border border-slate-200 border-dashed bg-white shadow-sm text-slate-500">
                        <Building2 size={40} className="mb-3 text-slate-300" />
                        <h3 className="text-lg font-semibold text-slate-700">No companies found</h3>
                        <p className="text-sm mt-1">Be the first to add a company to the directory.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {companies.map((company) => (
                            <Link
                                href={`/companies/${company?.slug}`}
                                key={company._id.toString()}
                                className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-500/10"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    {company.logo ? (
                                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                className="object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-xl font-bold text-blue-600 shadow-inner">
                                            {company.name.charAt(0)}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {company.name}
                                        </h3>

                                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500 font-medium">
                                            {company.location && (
                                                <span className="flex items-center gap-1 line-clamp-1">
                                                    <MapPin size={12} className="shrink-0" /> {company.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 line-clamp-3 mb-5 flex-1">
                                    {company.about}
                                </p>

                                <div className="mt-auto">
                                    {company.tags && company.tags.length > 0 && (
                                        <div className="mb-4 flex flex-wrap gap-1.5">
                                            {company.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                                    {tag}
                                                </span>
                                            ))}
                                            {company.tags.length > 3 && (
                                                <span className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                    +{company.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="text-xs font-semibold text-slate-500">
                                            {countsMap[company.name.toLowerCase()] || 0} Interviews
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1">
                                            View Details
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}