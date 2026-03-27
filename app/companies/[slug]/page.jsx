import React from "react";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";

import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { MongoClient } from "mongodb";
import ArticleCard from "@/components/ArticleCard";
import ClientThemeNavbar from "@/components/ClientThemeNavbar";

export default async function CompanyDetails({ params }) {
    await connectToDatabase();
    const client = new MongoClient(process.env.MONGODB_URI);

    const { slug } = await params;
    const company = await Company.findOne({ slug }).lean();

    if (!company) {
        return notFound();
    }
    const db = client.db("int-exp");
    const experience = db.collection("experience");
    const experiences = await experience.find({
        company: company.name
    }).toArray();
    const interviewsCount = experiences.length;

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafcff] pb-20 pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <ClientThemeNavbar />
            {/* Background elements (matching list view) */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -left-[10%] top-[-10%] h-[50vh] w-[50vw] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/15" />
                <div className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vw] rounded-full bg-cyan-300/10 blur-[130px] dark:bg-cyan-500/12" />
                <div className="absolute top-[30%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-indigo-300/10 blur-[100px] dark:bg-indigo-500/12" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">

                {/* Back Link */}
                <Link
                    href="/companies"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-8 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Back to Companies
                </Link>

                {/* Company Header */}
                <div className="group relative overflow-hidden bg-white/60 p-6 sm:p-10 shadow-[0_10px_35px_rgba(15,23,42,0.06)] rounded-3xl border border-slate-200/85 backdrop-blur-2xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_16px_40px_rgba(2,6,23,0.65)]">
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-cyan-500 via-blue-600 to-indigo-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-cyan-950/20 dark:to-transparent" />

                    <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">

                        {/* Logo */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-20 blur-md" />
                        {company.logo ? (
                            <div className="relative z-10 flex h-24 w-24 shrink-0 sm:h-32 sm:w-32 items-center justify-center rounded-3xl bg-white p-3 ring-4 ring-white shadow-sm dark:bg-slate-950 dark:ring-slate-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    className="object-contain h-full w-full"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div className="relative z-10 flex h-24 w-24 shrink-0 sm:h-32 sm:w-32 items-center justify-center rounded-3xl ring-4 ring-white bg-gradient-to-br from-blue-50 to-indigo-50 text-4xl sm:text-5xl font-bold text-blue-600 shadow-inner dark:bg-slate-950 dark:ring-slate-900 dark:from-cyan-900/40 dark:to-blue-900/40 dark:text-cyan-300">
                                {(company?.name?.charAt(0) || "C").toUpperCase()}
                            </div>
                        )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
                                {company.name}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                {company.location && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-slate-400 dark:text-slate-400" />
                                        {company.location}
                                    </div>
                                )}

                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline transition-all dark:text-cyan-400 dark:hover:text-cyan-300"
                                    >
                                        <Globe size={16} className="text-blue-500 dark:text-cyan-500" />
                                        Visit Website
                                    </a>
                                )}
                            </div>

                            {company.tags && company.tags.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Tag size={16} className="text-slate-400 mt-0.5 hidden sm:block dark:text-slate-500" />
                                    {company.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="ui-tag ui-tag-role px-3 py-1 text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats Block */}
                        <div className="flex flex-row sm:flex-col gap-4 w-full sm:w-auto mt-6 sm:mt-0 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-700/50">
                            <div className="flex-1 text-center sm:text-right">
                                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{interviewsCount}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 dark:text-slate-400">Interviews</div>
                            </div>
                            <div className="hidden sm:block w-full h-px bg-slate-200/80 dark:bg-slate-700/80"></div>
                            <div className="block sm:hidden w-px bg-slate-200/80 dark:bg-slate-700/80"></div>
                            <div className="flex-1 text-center sm:text-right">
                                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{company.stats?.reviewsCount || 0}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 dark:text-slate-400">Reviews</div>
                            </div>
                        </div>

                    </div>

                    <div className="relative z-10 mt-10 border-t border-slate-200/60 pt-8 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 dark:text-slate-100">About {company.name}</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed whitespace-pre-line dark:text-slate-300 dark:prose-invert">
                            {company.about}
                        </div>
                    </div>
                </div>

                {/* Experiences Section */}
                <div className="relative z-10 mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 px-2 dark:text-slate-100">Interview Experiences</h2>

                    {experiences.length === 0 ? (
                        <div className="border border-slate-200 border-dashed bg-white/50 backdrop-blur rounded-3xl p-10 text-center dark:border-slate-700/80 dark:bg-slate-900/50">
                            <Building2 size={40} className="mx-auto text-slate-300 mb-4 dark:text-slate-600" />
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Experiences Yet</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto dark:text-slate-400">
                                Experiences and questions from candidates who interviewed at {company.name} will appear here. Be the first to share one!
                            </p>
                            <Link
                                href="/post"
                                className="inline-block mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-blue-500/35 active:scale-95"
                            >
                                Share an Experience
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {experiences.map((exp) => (
                                <ArticleCard 
                                    key={exp._id.toString()} 
                                    article={{
                                        ...exp,
                                        date: exp.createdAt || exp.date
                                    }} 
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
