"use client";

import React, { useState } from "react";
import { Plus, Building2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AddCompanyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    about: "",
    website: "",
    logo: "",
    location: "",
    tags: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const res = await fetch("/api/postCompanies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Rediect to the companies directory
        router.push("/companies");
      } else {
        setError(result.error || "Failed to add company");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        
        <Link
          href="/companies"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} />
          Back to Directory
        </Link>
        
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 size={120} />
          </div>

          <div className="relative z-10">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              <Plus className="rounded-lg bg-blue-50 p-1 text-blue-600 dark:bg-cyan-950/40 dark:text-cyan-300" size={32} />
              Add New Company
            </h1>
            <p className="mb-8 mt-2 text-slate-500 dark:text-slate-400">
              Contribute to the directory by adding a company where students can post interview experiences.
            </p>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Company Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
                  placeholder="e.g. Google"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">About *</label>
                <textarea
                  name="about"
                  required
                  rows={4}
                  value={formData.about}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
                  placeholder="A brief description of the company and what they do..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Headquarters / Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
                    placeholder="e.g. Mountain View, CA"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Website URL</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Logo URL</label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
                  placeholder="https://.../logo.png"
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Provide a direct link to the company's transparent logo icon.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
                  placeholder="Tech, Cloud, FinTech (comma separated)"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-[1px] hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Plus size={20} />
                  )}
                  {submitting ? "Adding Company..." : "Add to Directory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
