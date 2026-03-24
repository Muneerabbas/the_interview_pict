import React from "react";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";

import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { MongoClient } from "mongodb";
import ArticleCard from "@/components/ArticleCard";

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
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">

                {/* Back Link */}
                <Link
                    href="/companies"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to Companies
                </Link>

                {/* Company Header */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">

                        {/* Logo */}
                        {company.logo ? (
                            <div className="relative flex h-24 w-24 shrink-0 sm:h-32 sm:w-32 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 p-2 shadow-inner">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    className="object-contain"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div className="flex h-24 w-24 shrink-0 sm:h-32 sm:w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-4xl sm:text-5xl font-bold text-blue-600 shadow-inner">
                                {company.name.charAt(0)}
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                {company.name}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                                {company.location && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-slate-400" />
                                        {company.location}
                                    </div>
                                )}

                                {company.website && (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline transition-all"
                                    >
                                        <Globe size={16} className="text-blue-500" />
                                        Visit Website
                                    </a>
                                )}
                            </div>

                            {company.tags && company.tags.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Tag size={16} className="text-slate-400 mt-0.5 hidden sm:block" />
                                    {company.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats Block */}
                        <div className="flex flex-row sm:flex-col gap-4 w-full sm:w-auto mt-6 sm:mt-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex-1 text-center sm:text-right">
                                <div className="text-2xl font-black text-slate-900">{interviewsCount}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Interviews</div>
                            </div>
                            <div className="hidden sm:block w-full h-px bg-slate-200"></div>
                            <div className="block sm:hidden w-px bg-slate-200"></div>
                            <div className="flex-1 text-center sm:text-right">
                                <div className="text-2xl font-black text-slate-900">{company.stats?.reviewsCount || 0}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Reviews</div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-10 border-t border-slate-100 pt-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">About {company.name}</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed whitespace-pre-line">
                            {company.about}
                        </div>
                    </div>
                </div>

                {/* Experiences Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 px-2">Interview Experiences</h2>

                    {experiences.length === 0 ? (
                        <div className="border border-slate-200 border-dashed bg-white/50 backdrop-blur rounded-3xl p-10 text-center">
                            <Building2 size={40} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800">No Experiences Yet</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                Experiences and questions from candidates who interviewed at {company.name} will appear here. Be the first to share one!
                            </p>
                            <Link
                                href="/post"
                                className="inline-block mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 focus:outline-none"
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
