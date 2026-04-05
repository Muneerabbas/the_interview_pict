import Link from "next/link";
import dynamic from "next/dynamic";
import MarkdownRenderer from "@/components/Markdown";
import SingleExperienceThemeShell from "@/components/SingleExperienceThemeShell";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Compass,
  Eye,
  FileText,
  Clock,
  Share2,
  Globe,
  Heart,
  ThumbsUp,
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
    <section className="relative mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-[0_16px_42px_rgba(2,6,23,0.65)] sm:p-7">
      <div className="mb-4 h-7 w-52 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
      <div className="mt-3 h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
    </section>
  ),
});

import { cache } from "react";

import SimilarExperienceClient from "@/components/SimilarExperienceClient";

const revalidateTime = 60;

// Memoized data fetcher to prevent duplicate hits during metadata & page render
const getExperienceData = cache(async (id, baseUrl) => {
  try {
    const [expResponse, relatedResponse] = await Promise.all([
      fetch(`${baseUrl}/api/exp?uid=${id}&_ts=${Date.now()}`, { cache: "no-store", next: { revalidate: 0 } }),
      fetch(`${baseUrl}/api/topStories?itemsPerPage=12&_ts=${Date.now()}`, { cache: "no-store", next: { revalidate: 0 } }),
    ]);

    if (!expResponse.ok) return { data: null, articles: [] };

    const expData = await expResponse.json();
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

  const title = `${data?.company || "Interview"} Experience`;
  const description = `Read ${data?.name || "a candidate"}'s interview experience at ${data?.company || "a top company"}.`;
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
  if (!id) {
    return (
      <SingleExperienceThemeShell>
        <div className="mx-auto mt-24 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-lg text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Invalid request.
        </div>
      </SingleExperienceThemeShell>
    );
  }

  const { data, articles } = await getExperienceData(id, baseUrl);

  if (!data) {
    return (
      <SingleExperienceThemeShell>
        <div className="mx-auto mt-24 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-lg text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Failed to load experience.
        </div>
      </SingleExperienceThemeShell>
    );
  }

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
  const articleDescription = `Read ${data?.name}'s detailed interview experience as ${data?.role} at ${data?.company}.`;
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
          headline: `${data?.company} Interview Experience: ${data?.role}`,
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
        <div className="relative min-h-screen overflow-x-clip bg-[#f8fbff] dark:bg-[#020617]">
          <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_12%_14%,rgba(125,211,252,0.24),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f3f6fb_55%,#edf2f8_100%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(45,212,191,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]" />
          <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 pb-14 pt-24 sm:px-6 sm:pb-16 lg:px-8">
            <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/20" />
            <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/20" />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/feed"
                prefetch={true}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
              >
                <ArrowLeft size={16} />
                Back to feed
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700 dark:border-cyan-500/35 dark:bg-cyan-950/35 dark:text-cyan-300">
                <Compass size={13} />
                Single Experience
              </div>
            </div>

            <div className="grid gap-6">
              <article className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-[0_14px_42px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-900/90 dark:shadow-[0_18px_46px_rgba(2,6,23,0.65)]">
                <header className="relative overflow-hidden border-b border-slate-100/80 bg-gradient-to-br from-slate-50/50 to-blue-50/30 px-4 py-8 pr-14 dark:border-slate-700/50 dark:from-slate-900/50 dark:to-blue-950/20 sm:px-8 sm:py-10 sm:pr-8 lg:px-10">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl dark:bg-cyan-500/20" />
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
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:bg-cyan-500/10 dark:text-cyan-300">
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
                          className="text-3xl font-black leading-tight tracking-tight text-slate-900 transition hover:text-blue-700 dark:text-slate-100 dark:hover:text-cyan-300 lg:text-4xl"
                        >
                          {data?.name}
                        </Link>
                      ) : (
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100 lg:text-4xl">
                          {data?.name}
                        </h1>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={15} className="text-blue-600 dark:text-cyan-300" />
                          <span className="text-slate-900 dark:text-slate-200 font-bold">{data?.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={15} className="text-blue-600 dark:text-cyan-300" />
                          <span>{data?.role}</span>
                        </div>
                      </div>

                      <PostCompanyActions
                        companyName={data?.company}
                        experienceUid={id}
                        authorEmail={typeof data?.email === "string" ? data.email : ""}
                        className="mt-3"
                      />

                      {/* Header Meta: Flattened Inline Row */}
                      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100/80 pt-5 dark:border-slate-700/50">
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-100/50 px-3 py-1 text-[11.5px] font-bold text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                          <GraduationCap size={13} />
                          {data?.branch} {data?.batch}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-100/50 px-3 py-1 text-[11.5px] font-bold text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                          <CalendarDays size={13} />
                          {data?.date ? formatLongDate(data.date) : "Date unavailable"}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-100/50 px-3 py-1 text-[11.5px] font-bold text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
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

                <section className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
                  <div className="mx-auto w-full max-w-[720px] text-slate-700 dark:text-slate-300">
                    <MarkdownRenderer content={data?.exp_text || ""} />
                  </div>
                </section>

                <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                  <p>Reads: {data?.views}</p>
                  <p>Shared on theInterview community feed</p>
                </footer>
              </article>

            </div>

            <SimilarExperienceClient articles={articles} />

            <CommentsSection
              experienceId={experienceObjectId}
              companyName={data?.company}
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
