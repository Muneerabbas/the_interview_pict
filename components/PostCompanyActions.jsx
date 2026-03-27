"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Building2, Pencil } from "lucide-react";
import { companySlugFromName } from "@/lib/companySlug";

/** Links to company directory, public company edit, and owner post edit. */
export default function PostCompanyActions({
  companyName = "",
  experienceUid = "",
  authorEmail = "",
  className = "",
}) {
  const { data: session } = useSession();
  const slug = companySlugFromName(companyName);
  const hasCompanyPage = Boolean(slug);
  const isOwner =
    session?.user?.email &&
    authorEmail &&
    String(session.user.email).toLowerCase() === String(authorEmail).toLowerCase();

  if (!hasCompanyPage && !isOwner) return null;

  const linkClass =
    "inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:bg-slate-800 dark:hover:text-cyan-200";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {hasCompanyPage && (
        <Link href={`/companies/${slug}`} prefetch={true} className={linkClass}>
          <Building2 size={13} className="shrink-0 text-blue-600 dark:text-cyan-400" />
          Company page
        </Link>
      )}
      {hasCompanyPage && (
        <Link href={`/edit-company/${slug}`} prefetch={true} className={linkClass}>
          <Pencil size={13} className="shrink-0 text-blue-600 dark:text-cyan-400" />
          Edit company
        </Link>
      )}
      {isOwner && experienceUid && (
        <Link href={`/edit/${experienceUid}`} prefetch={true} className={linkClass}>
          <Pencil size={13} className="shrink-0 text-blue-600 dark:text-cyan-400" />
          Edit post
        </Link>
      )}
    </div>
  );
}
