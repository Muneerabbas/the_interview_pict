import React from "react";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";
import Navbar from "@/components/Navbar";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import mongoose from "mongoose";

// Cache page output for faster navigation while keeping data reasonably fresh.
export const revalidate = 300;

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

    return (
        <div className="relative min-h-screen bg-[#fafcff] pt-24 pb-20 overflow-x-hidden text-slate-900">
            <Navbar />
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -left-[10%] top-[-10%] h-[50vh] w-[50vw] rounded-full bg-blue-400/10 blur-[100px]" />
                <div className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vw] rounded-full bg-cyan-300/10 blur-[130px]" />
                <div className="absolute bottom-[-10%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-indigo-300/10 blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="relative z-10">
                        <h1 className="text-[28px] sm:text-4xl font-extrabold tracking-tight flex items-center justify-center sm:justify-start gap-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 pb-1">
                            <Building2 className="text-blue-500" size={34} />
                            Company Directory
                        </h1>
                        <p className="mt-3 text-slate-600 max-w-2xl text-[15px] sm:text-lg">
                            Explore the companies where candidates have interviewed and prepare for your next opportunity.
                        </p>
                    </div>
                    <Link
                        href="/add-company"
                        className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:bg-slate-800 hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)] active:scale-95"
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
                    <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {companies.map((company) => (
                            <Link
                                href={`/companies/${company?.slug}`}
                                key={company._id.toString()}
                                className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="relative z-10 flex items-start gap-4 mb-4">
                                    {company.logo ? (
                                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/60 bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-105">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                className="object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-50 to-indigo-50 text-xl font-bold text-blue-600 shadow-inner ring-1 ring-white/50 transition-transform duration-300 group-hover:scale-105">
                                            {company.name.charAt(0)}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-[17px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
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
                                                <span key={tag} className="inline-flex items-center rounded-[6px] border border-white/60 bg-white/60 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur-md">
                                                    {tag}
                                                </span>
                                            ))}
                                            {company.tags.length > 3 && (
                                                <span className="inline-flex items-center rounded-[6px] border border-white/40 bg-white/40 px-2 py-0.5 text-[11px] font-bold text-slate-500 shadow-sm backdrop-blur-md">
                                                    +{company.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative z-10 flex items-center justify-between border-t border-slate-200/60 pt-4">
                                        <div className="text-[13px] font-bold text-slate-500">
                                            {countsMap[company.name.toLowerCase()] || 0} Interviews
                                        </div>
                                        <div className="flex items-center gap-1 text-[13px] font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                            View Details
                                            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
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
