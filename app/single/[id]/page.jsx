import Link from "next/link";
import dynamic from "next/dynamic";
import MarkdownRenderer from "@/components/Markdown";
import SingleExperienceThemeShell from "@/components/SingleExperienceThemeShell";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Eye,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { JsonLd } from "react-schemaorg";
import ArticleCard from "@/components/ArticleCard";
import ShareButton from "@/components/ShareButton";
import ScrollViewTracker from "@/components/ScrollViewTracker";
import ProfileAvatar from "@/components/ProfileAvatar";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";
import { getServerOrigin } from "@/lib/serverOrigin";
import LikeButton from "@/components/LikeButton";
import PostCompanyActions from "@/components/PostCompanyActions";

const CommentsSection = dynamic(() => import("@/components/CommentsSection"), {
  ssr: true,
  loading: () => (
    <section className="relative mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="mb-4 h-7 w-52 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
      <div className="mt-3 h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
    </section>
  ),
});

import { cache } from "react";
import { notFound } from "next/navigation";

import SimilarExperienceClient from "@/components/SimilarExperienceClient";

// Memoized data fetcher to prevent duplicate hits during metadata & page render
const getExperienceData = cache(async (id, baseUrl) => {
  try {
    const expResponse = await fetch(`${baseUrl}/api/exp?uid=${id}&_ts=${Date.now()}`, {
      cache: "no-store",
      next: { revalidate: 0 }
    });

    if (!expResponse.ok) return { data: null, articles: [] };

    const expData = await expResponse.json();
    const isTale = expData?.content_type === "tale";

    const relatedResponse = await fetch(`${baseUrl}/api/topStories?itemsPerPage=12&type=${isTale ? "tale" : "interview"}&_ts=${Date.now()}`, {
      cache: "no-store",
      next: { revalidate: 0 }
    });

    const relatedData = relatedResponse.ok ? await relatedResponse.json() : [];

    const data = {
      ...expData,
      profile_pic: resolveProfileImage(expData),
      name: resolveProfileName(expData),
      exp_text: expData?.exp_text || "",
      branch: expData?.branch || "Branch not shared",
      batch: expData?.batch || "",
      company: expData?.company || "Company not shared",
      role: expData?.role || "Role not shared",
      views: Number(expData?.views) || 0,
    };

    const articles = (relatedData || [])
      .filter((article) => article.uid !== id)
      .filter((article, index, arr) => arr.findIndex((a) => a.uid === article.uid) === index)
      .slice(0, 8);

    return { data, articles };
  } catch (error) {
    console.error("Data fetch error:", error);
    return { data: null, articles: [] };
  }
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const baseUrl = await getServerOrigin();
  const { data } = await getExperienceData(id, baseUrl);

  if (!data) {
    return {
      title: "Interview Experience Not Found",
      robots: { index: false, follow: false },
    };
  }

  const isTale = data?.content_type === "tale";
  const title = isTale
    ? (data?.title || `${data?.name}'s Tale`)
    : `${data?.company || "Interview"} Experience`;
  const description = isTale
    ? `Read ${data?.name}'s story: ${data?.title || "a general experience"}.`
    : `Read ${data?.name}'s interview experience at ${data?.company || "a top company"}.`;
  const canonical = `/single/${id}`;
  const ogImage = data?.profile_pic || `${baseUrl}/app_icon.png`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | The Interview Room`,
      description,
      url: `${baseUrl}${canonical}`,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      title: `${title} | The Interview Room`,
      description,
      images: [ogImage],
    },
  };
}

export default async function SimilarExperience({ params }) {
  const { id } = await params;
  const baseUrl = await getServerOrigin();

  // A missing post used to render an error <div> with HTTP 200, so deleted posts
  // stayed indexable soft-404s and users never saw a real 404 page.
  if (!id) notFound();

  const { data, articles } = await getExperienceData(id, baseUrl);

  if (!data) notFound();

  const formatLongDate = (date) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return parsed.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const articleUrl = `${baseUrl}/single/${id}`;
  const isTale = data?.content_type === "tale";
  const articleDescription = isTale
    ? `Read ${data?.name}'s tale about ${data?.company || "their experience"}.`
    : `Read ${data?.name}'s detailed interview experience as ${data?.role} at ${data?.company}.`;
  const profilePicUrl = data?.profile_pic || `${baseUrl}/app_icon.png`;
  const publicProfilePath = data?.email ? `/profile/public/${encodeURIComponent(data.email)}` : null;
  const readMinutes = Math.max(1, Math.round((data?.exp_text || "").split(/\s+/).filter(Boolean).length / 220));
  const isToday = data?.date && new Date(data.date).toDateString() === new Date().toDateString();
  const experienceObjectId =
    typeof data?._id === "string" ? data._id : data?._id?.$oid ? data._id.$oid : String(data?._id || "");

  return (
    <>
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: isTale ? (data?.title || `Story by ${data?.name}`) : `${data?.company} Interview Experience: ${data?.role}`,
          author: {
            "@type": "Person",
            name: data?.name,
          },
          datePublished: data?.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          dateModified: data?.updatedAt
            ? new Date(data.updatedAt).toISOString()
            : data?.date
              ? new Date(data.date).toISOString()
              : new Date().toISOString(),
          image: profilePicUrl,
          publisher: {
            "@type": "Organization",
            name: "theInterview",
            logo: {
              "@type": "ImageObject",
              url: `${baseUrl}/app_icon.png`,
            },
          },
          description: articleDescription,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
          },
        }}
      />

      <SingleExperienceThemeShell>
        <div className="relative min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-950">
          <div className="relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-24 sm:px-6 sm:pb-16 lg:px-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={isTale ? "/tales" : "/feed"}
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
              >
                <ArrowLeft size={16} />
                {isTale ? "Back to tales" : "Back to feed"}
              </Link>
              <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-slate-50/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400 dark:border-slate-700/70 dark:bg-slate-800/50 dark:text-slate-500">
                {isTale ? "Tales" : "Single Experience"}
              </div>
            </div>

            <div className="grid gap-6">
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {isTale ? (
                  <>
                    <header className="relative border-b border-slate-100 px-4 py-7 pr-14 dark:border-slate-800 sm:px-8 sm:py-8 sm:pr-8 lg:px-10">
                      <ShareButton id={id} data={data} />

                      <div className="relative">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start">
                          {publicProfilePath ? (
                            <Link
                              href={publicProfilePath}
                              className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg transition hover:scale-[1.02] dark:border-slate-900 sm:h-24 sm:w-24"
                              aria-label={`View ${data?.name || "user"} profile`}
                            >
                              <ProfileAvatar
                                src={data?.profile_pic}
                                alt={`${data?.name}'s profile picture`}
                                name={data?.name}
                                className="h-full w-full object-cover"
                              />
                            </Link>
                          ) : (
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-slate-900 sm:h-24 sm:w-24">
                              <ProfileAvatar
                                src={data?.profile_pic}
                                alt={`${data?.name}'s profile picture`}
                                name={data?.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-400">
                                Tales
                              </span>
                              {isToday && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">
                                  <Sparkles size={11} />
                                  Fresh
                                </span>
                              )}
                            </div>

                            <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 transition dark:text-slate-100 lg:text-3xl">
                              {data?.title || data?.name}
                            </h1>

                            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                              <span className="text-blue-600 dark:text-blue-400">By</span>
                              {publicProfilePath ? (
                                <Link
                                  href={publicProfilePath}
                                  className="text-slate-900 underline decoration-slate-200/50 underline-offset-4 transition hover:text-blue-700 hover:decoration-blue-400 dark:text-slate-200 dark:decoration-slate-700/50 dark:hover:text-blue-300"
                                >
                                  {data?.name}
                                </Link>
                              ) : (
                                <span className="text-slate-900 dark:text-slate-200">{data?.name}</span>
                              )}

                              {(data?.college || data?.company) && (
                                <span className="flex items-center gap-2 before:content-['•'] before:text-slate-300 dark:before:text-slate-700">
                                  {data?.college || data?.company}
                                </span>
                              )}
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100/80 pt-5 dark:border-slate-700/50">
                              <div className="flex items-center gap-1.5 rounded-full bg-slate-100/45 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                                <GraduationCap size={13} />
                                {data?.branch} {data?.batch}
                              </div>
                              <div className="flex items-center gap-1.5 rounded-full bg-slate-100/45 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                                <CalendarDays size={13} />
                                {data?.date ? formatLongDate(data.date) : "Date unavailable"}
                              </div>
                              <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11.5px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                <Eye size={13} />
                                {data?.views} reads
                              </div>
                              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                <span className="text-[13px]">✦</span>
                                {readMinutes} min read
                              </div>
                              <div className="ml-auto inline-flex items-center gap-2">
                                <LikeButton id={id} initialLikes={data?.likes || []} className="border-0 bg-transparent p-0 shadow-none hover:bg-transparent" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </header>

                    <section className="px-4 py-7 sm:px-8 sm:py-9 lg:px-12">
                      <div className="mx-auto w-full max-w-[800px] text-slate-700 dark:text-slate-300">
                        <MarkdownRenderer content={data?.exp_text || ""} />
                      </div>
                    </section>

                    <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                        <Eye size={14} className="text-blue-600 dark:text-blue-300" />
                        {data?.views} reads
                      </p>
                      <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Shared on theInterview tales feed</p>
                    </footer>
                  </>
                ) : (
                  <>
                    <header className="relative border-b border-slate-100 px-4 py-7 pr-14 dark:border-slate-800 sm:px-8 sm:py-8 sm:pr-8 lg:px-10">
                      <ShareButton id={id} data={data} />

                      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                        {publicProfilePath ? (
                          <Link
                            href={publicProfilePath}
                            className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg transition hover:scale-[1.02] dark:border-slate-900 sm:h-24 sm:w-24 lg:h-26 lg:w-26"
                            aria-label={`View ${data?.name || "user"} profile`}
                          >
                            <ProfileAvatar
                              src={data?.profile_pic}
                              alt={`${data?.name}'s profile picture`}
                              name={data?.name}
                              className="h-full w-full object-cover"
                            />
                          </Link>
                        ) : (
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-slate-900 sm:h-24 sm:w-24 lg:h-26 lg:w-26">
                            <ProfileAvatar
                              src={data?.profile_pic}
                              alt={`${data?.name}'s profile picture`}
                              name={data?.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-blue-500/10 dark:text-slate-500">
                              Interview Experience
                            </span>
                            {isToday && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">
                                <Sparkles size={11} />
                                Fresh
                              </span>
                            )}
                          </div>

                          {publicProfilePath ? (
                            <Link
                              href={publicProfilePath}
                              className="text-2xl font-bold leading-tight tracking-tight text-slate-900 transition hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300 lg:text-3xl"
                            >
                              {data?.name}
                            </Link>
                          ) : (
                            <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
                              {data?.name}
                            </h1>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {data?.company && (
                              <div className="flex items-center gap-1.5">
                                <Building2 size={15} className="text-blue-600 dark:text-blue-300" />
                                <span className="font-bold text-slate-900 dark:text-slate-200">
                                  {data?.company}
                                </span>
                              </div>
                            )}
                            {data?.role && (
                              <div className="flex items-center gap-1.5">
                                <Briefcase size={15} className="text-blue-600 dark:text-blue-300" />
                                <span>{data?.role}</span>
                              </div>
                            )}
                          </div>

                          <PostCompanyActions
                            companyName={data?.company}
                            experienceUid={id}
                            authorEmail={typeof data?.email === "string" ? data.email : ""}
                            className="mt-4"
                          />

                          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100/80 pt-5 dark:border-slate-700/50">
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100/45 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                              <GraduationCap size={13} />
                              {data?.branch} {data?.batch}
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100/45 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                              <CalendarDays size={13} />
                              {data?.date ? formatLongDate(data.date) : "Date unavailable"}
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11.5px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                              <Eye size={13} />
                              {data?.views} reads
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                              <span className="text-[13px]">✦</span>
                              {readMinutes} min read
                            </div>
                            <div className="ml-auto inline-flex items-center gap-2">
                              <LikeButton id={id} initialLikes={data?.likes || []} className="border-0 bg-transparent p-0 shadow-none hover:bg-transparent" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </header>

                    <section className="px-4 py-7 sm:px-8 sm:py-9 lg:px-12">
                      <div className="mx-auto w-full max-w-[800px] text-slate-700 dark:text-slate-300">
                        <MarkdownRenderer content={data?.exp_text || ""} />
                      </div>
                    </section>

                    <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                      <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                        <Eye size={14} className="text-blue-600 dark:text-blue-300" />
                        {data?.views} reads
                      </p>
                      <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Shared on theInterview community feed</p>
                    </footer>
                  </>
                )}
              </article>

            </div>

            <SimilarExperienceClient articles={articles} />

            <CommentsSection
              experienceId={experienceObjectId}
              companyName={isTale ? (data?.college || data?.company) : data?.company}
              articleAuthorName={data?.name}
            />
          </div>

          <div className="h-[20px]" />
        </div>

        <ScrollViewTracker id={id} />
      </SingleExperienceThemeShell>
    </>
  );
}
