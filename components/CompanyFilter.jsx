"use client";

import { motion } from "framer-motion";

const TOP_COMPANIES = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
    "Uber", "Airbnb", "NVIDIA", "Intel", "Adobe", "Oracle"
];

const CompanyFilter = ({ selectedCompany, onSelectCompany, isDarkMode }) => {
    return (
        <div className="mb-6 w-full">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Filter by Company
                </span>
                {selectedCompany && (
                    <button
                        onClick={() => onSelectCompany(null)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                    onClick={() => onSelectCompany(null)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!selectedCompany
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 dark:bg-cyan-500 dark:shadow-cyan-500/30"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-500/50"
                        }`}
                >
                    All
                </button>
                {TOP_COMPANIES.map((company) => (
                    <button
                        key={company}
                        onClick={() => onSelectCompany(company)}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${selectedCompany === company
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 dark:bg-cyan-500 dark:shadow-cyan-500/30"
                                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-500/50"
                            }`}
                    >
                        {company}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CompanyFilter;
