import Link from "next/link";
import dynamic from "next/dynamic";
import MarkdownRenderer from "@/components/Markdown";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Compass,
  Eye,
  FileText,
  GraduationCap,
  Layers3,
  Sparkles,
  UserRound,
} from "lucide-react";
import { JsonLd } from "react-schemaorg";
import ArticleCard from "@/components/ArticleCard";
import ShareButton from "@/components/ShareButton";
import ScrollViewTracker from "@/components/ScrollViewTracker";
import ProfileAvatar from "@/components/ProfileAvatar";
import LikeButton from "@/components/LikeButton";

const CommentsSection = dynamic(() => import("@/components/CommentsSection"), {
  ssr: true,
  loading: () => (
    <section className="relative mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7">
      <div className="mb-4 h-7 w-52 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="mt-3 h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
    </section>
  ),
});

const revalidateTime = 3600;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pict.live";

export async function generateMetadata({ params }) {
  const { id } = await params;

  const metadataBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pict.live";
  let data = {};

  try {
    const response = await fetch(`${metadataBaseUrl}/api/exp?uid=${id}`, {
      next: { revalidate: revalidateTime },
    });

    if (response.ok) {
      data = await response.json();
    }
  } catch (error) {
    console.error("Metadata fetch error:", error);
  }

  return {
    title: `${data?.company || "theInterview"} Interview Experience`,
    description: `Read ${data?.name || "a candidate"}'s interview experience at ${data?.company || "a top company"}.`,
    metadataBase: new URL(metadataBaseUrl),
  };
}

export default async function SimilarExperience({ params }) {
  const { id } = await params;
  if (!id) {
    return (
      <div className="mx-auto mt-24 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-lg text-slate-600 shadow-sm">
        Invalid request.
      </div>
    );
  }

  let data = null;
  let articles = [];

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

  try {
    const [expResponse, feedResponse] = await Promise.all([
      fetch(`${baseUrl}/api/exp?uid=${id}`, { next: { revalidate: revalidateTime } }),
      fetch(`${baseUrl}/api/feed`, { next: { revalidate: revalidateTime } }),
    ]);

    const expDataResponse = await expResponse.json();
    const feedDataResponse = await feedResponse.json();

    data = {
      ...expDataResponse,
      profile_pic: expDataResponse?.profile_pic?.replace(/"/g, "") || "",
      name: expDataResponse?.name?.replace(/"/g, "") || "Anonymous Candidate",
      exp_text: expDataResponse?.exp_text || "",
      branch: expDataResponse?.branch || "Branch not shared",
      batch: expDataResponse?.batch || "",
      company: expDataResponse?.company || "Company not shared",
      role: expDataResponse?.role || "Role not shared",
      views: Number(expDataResponse?.views) || 0,
    };

    articles = (feedDataResponse || [])
      .filter((article) => article.uid !== id)
      .filter((article, index, arr) => arr.findIndex((a) => a.uid === article.uid) === index)
      .slice(0, 8);
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="mx-auto mt-24 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-lg text-slate-600 shadow-sm">
        Failed to load experience.
      </div>
    );
  }

  const articleUrl = `${baseUrl}/single/${id}`;
  const articleDescription = `Read ${data?.name}'s detailed interview experience as ${data?.role} at ${data?.company}.`;
  const profilePicUrl = data?.profile_pic || `${baseUrl}/icon.png`;
  const readMinutes = Math.max(1, Math.round((data?.exp_text || "").split(/\s+/).filter(Boolean).length / 220));
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
          image: profilePicUrl,
          publisher: {
            "@type": "Organization",
            name: "theInterview",
            logo: {
              "@type": "ImageObject",
              url: `${baseUrl}/icon.png`,
            },
          },
          description: articleDescription,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
          },
        }}
      />

      <div className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_12%_14%,rgba(125,211,252,0.24),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f3f6fb_55%,#edf2f8_100%)]">
        <Navbar />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-24 sm:px-6 sm:pb-16 lg:px-8">
          <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/feed"
              prefetch={true}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Back to feed
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
              <Compass size={13} />
              Single Experience
            </div>
          </div>

          <div className="grid gap-6">
            <article className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-[0_14px_42px_rgba(15,23,42,0.1)] backdrop-blur-sm">
              <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/60 px-4 py-6 pr-14 sm:px-8 sm:py-8 sm:pr-8 lg:px-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-200/35 blur-3xl" />
                <ShareButton id={id} data={data} />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    <ProfileAvatar
                      src={data?.profile_pic}
                      alt={`${data?.name}'s profile picture`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <FileText size={13} />
                      Interview Experience
                    </p>

                    <h1 className="mt-3 text-[24px] font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                      {data?.name}
                    </h1>

                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                      <UserRound size={15} className="text-slate-500" />
                      {data?.role} interview at {data?.company}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
                      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                        <GraduationCap size={14} className="text-indigo-600" />
                        <span className="truncate">
                          {data?.branch} {data?.batch}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                        <Building2 size={14} className="text-indigo-600" />
                        <span className="truncate">{data?.company}</span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                        <Briefcase size={14} className="text-indigo-600" />
                        <span className="truncate">{data?.role}</span>
                      </div>

                      <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 truncate">
                          <Eye size={14} className="text-indigo-600" />
                          <span className="truncate">{data?.views} Reads</span>
                        </div>
                        <LikeButton id={id} initialLikes={data?.likes || []} className="border-0 bg-transparent p-0 shadow-none hover:bg-transparent" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <time className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                        <CalendarDays size={14} className="text-slate-500" />
                        <span className="whitespace-normal">{data?.date ? formatLongDate(data.date) : "Date unavailable"}</span>
                      </time>
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <Sparkles size={13} />
                        ~{readMinutes} min read
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              <section className="px-4 py-5 sm:px-8 sm:py-7 lg:px-10">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <FileText size={13} className="text-slate-500" />
                    Detailed Walkthrough
                  </div>
                  <span className="text-xs font-medium text-slate-500">Structured candidate perspective</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Layers3 size={15} className="text-slate-600" />
                      Experience Details
                    </span>
                  </div>
                  <div className="bg-white px-1 sm:px-2">
                    <div className="mx-auto w-full max-w-[900px] text-slate-700">
                      <MarkdownRenderer content={data?.exp_text || ""} />
                    </div>
                  </div>
                </div>
              </section>

              <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                <p>Reads: {data?.views}</p>
                <p>Shared on theInterview community feed</p>
              </footer>
            </article>

          </div>

          <section className="relative mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/92 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
            <div className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-sky-200/35 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />

            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
              <div>
                <h2 className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  <Layers3 size={21} className="text-indigo-600" />
                  Related Experiences
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Explore similar interview stories from other candidates.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {articles.length} posts
              </span>
            </div>

            <div className="relative -mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
              {articles.map((article) => (
                <div key={article.uid} className="w-[86vw] max-w-[360px] min-w-[280px] shrink-0 sm:w-[360px]">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </section>

          <CommentsSection
            experienceId={experienceObjectId}
            companyName={data?.company}
            articleAuthorName={data?.name}
          />
        </div>

        <div className="h-[20px]" />
      </div>

      <ScrollViewTracker id={id} />
    </>
  );
}
