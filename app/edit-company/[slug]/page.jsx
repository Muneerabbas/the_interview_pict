"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function EditCompanyPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    website: "",
    logo: "",
    location: "",
    tags: "",
  });

  const normalizedSlug = useMemo(() => String(slug || ""), [slug]);

  useEffect(() => {
    let cancelled = false;
    async function loadCompany() {
      if (!normalizedSlug) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/postCompanies?slug=${encodeURIComponent(normalizedSlug)}`);
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to load company");
        }
        if (cancelled) return;
        const c = result.data || {};
        setFormData({
          name: c.name || "",
          about: c.about || "",
          website: c.website || "",
          logo: c.logo || "",
          location: c.location || "",
          tags: Array.isArray(c.tags) ? c.tags.join(", ") : "",
        });
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCompany();
    return () => {
      cancelled = true;
    };
  }, [normalizedSlug]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const res = await fetch("/api/postCompanies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSlug: normalizedSlug,
          ...formData,
          tags: tagsArray,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update company");
      }
      const nextSlug = result?.data?.slug || normalizedSlug;
      router.push(`/companies/${nextSlug}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafcff] pb-20 pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Navbar showThemeToggle />
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[10%] top-[-10%] h-[50vh] w-[50vw] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/15" />
          <div className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vw] rounded-full bg-cyan-300/10 blur-[130px] dark:bg-cyan-500/12" />
          <div className="absolute top-[30%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-indigo-300/10 blur-[100px] dark:bg-indigo-500/12" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading company...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafcff] pb-20 pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[-10%] h-[50vh] w-[50vw] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/15" />
        <div className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vw] rounded-full bg-cyan-300/10 blur-[130px] dark:bg-cyan-500/12" />
        <div className="absolute top-[30%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-indigo-300/10 blur-[100px] dark:bg-indigo-500/12" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
        <Link
          href={normalizedSlug ? `/companies/${normalizedSlug}` : "/companies"}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} />
          Back to Company
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white/75 p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_16px_40px_rgba(2,6,23,0.65)] sm:p-10">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-cyan-500 via-blue-600 to-indigo-500" />
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 size={120} />
          </div>

          <div className="relative z-10">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              <Save className="rounded-lg bg-blue-50 p-1 text-blue-600 dark:bg-cyan-950/40 dark:text-cyan-300" size={32} />
              Edit Company
            </h1>
            <p className="mb-8 mt-2 text-slate-500 dark:text-slate-400">
              Anyone can update company details for now.
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
                  value={formData.about}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:bg-slate-800 dark:focus:ring-cyan-500/20"
                  placeholder="A brief description of the company and what they do..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Provide a direct link to the company&apos;s transparent logo icon.</p>
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
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-[1px] hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
