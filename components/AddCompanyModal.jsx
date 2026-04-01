import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Globe, MapPin, Tag } from "lucide-react";

export default function AddCompanyModal({ isOpen, onClose, onSuccess, initialName = "" }) {
    const [formData, setFormData] = useState({
        name: initialName,
        about: "",
        logo: "",
        location: "",
        website: "",
        tags: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            setError("Company Name is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/addCompany", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : ["Interview"]
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to create company");
            }

            onSuccess(data.company);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Building2 size={18} className="text-blue-500" /> Register Company
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 sm:p-6 pb-2 space-y-4">
                                {error && (
                                    <div className="rounded-lg bg-red-50 p-3 text-[13px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[14px] font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20"
                                        placeholder="e.g. Acme Corp"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                        About / Description
                                    </label>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[14px] font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20"
                                        placeholder="Brief description of the company..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Globe size={14} className="text-slate-400" /> Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <MapPin size={14} className="text-slate-400" /> Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                        Logo Image URL
                                    </label>
                                    <input
                                        type="url"
                                        name="logo"
                                        value={formData.logo}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20"
                                        placeholder="https://logo.com/image.png"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Tag size={14} className="text-slate-400" /> Tags
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-[14px] font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20"
                                        placeholder="e.g. Startup, Fintech, MNC (comma separated)"
                                    />
                                </div>

                                <div className="pt-4 pb-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/30 disabled:opacity-70 dark:shadow-blue-900/20 dark:hover:bg-blue-500 dark:hover:shadow-blue-900/30"
                                    >
                                        {loading ? "Registering..." : "Add Company"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
