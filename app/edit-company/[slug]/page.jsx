"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";

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
      <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-slate-600 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading company...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Link
          href={normalizedSlug ? `/companies/${normalizedSlug}` : "/companies"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Company
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 size={120} />
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Save className="text-blue-600 rounded-lg bg-blue-50 p-1" size={32} />
              Edit Company
            </h1>
            <p className="text-slate-500 mt-2 mb-8">
              Anyone can update company details for now.
            </p>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">About *</label>
                <textarea name="about" required value={formData.about} onChange={handleChange} rows={5} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logo URL</label>
                <input type="url" name="logo" value={formData.logo} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags (comma separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-[1px] hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
