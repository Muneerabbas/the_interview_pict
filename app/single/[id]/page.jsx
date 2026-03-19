import MarkdownRenderer from "@/components/Markdown";
import Navbar from "@/components/Navbar";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Eye,
  CalendarDays,
  FileText,
  NotebookPen,
  Layers3,
  UserRound,
  ListChecks,
  MessageSquareText,
  BadgeCheck,
  ScrollText,
} from "lucide-react";
import { JsonLd } from "react-schemaorg";
import ArticleCard from "@/components/ArticleCard";
import ShareButton from "@/components/ShareButton";
import ScrollViewTracker from "@/components/ScrollViewTracker";
import ProfileAvatar from "@/components/ProfileAvatar";

const revalidateTime = 3000;
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.pict.live";
export async function generateMetadata({ params }) {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.pict.live";

  let data = {};

  try {
    const response = await fetch(`${baseUrl}/api/exp?uid=${id}`, {
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
    description:
      `Read ${data?.name}'s interview experience at ${data?.company}.`,
    metadataBase: new URL(baseUrl),
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
  let feedArticles = [];
  let expData = null;

  const formattedDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
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

    expData = expDataResponse;

    data = {
      ...expData,
      profile_pic: expData?.profile_pic?.replace(/"/g, ""),
      name: expData?.name?.replace(/"/g, ""),
      exp_text: expData?.exp_text?.replace(/"/g, ""),
    };

    feedArticles = feedDataResponse || [];

    articles = [...feedArticles];
    articles = articles.filter((article) => article.uid !== id);
    articles = articles.filter(
      (article, index) =>
        articles.findIndex((a) => a.uid === article.uid) === index
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="mx-auto mt-24 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-lg text-slate-600 shadow-sm">
        Failed to load experience.
      </div>
    );
  }

  const articleUrl = `/single/${id}`;
  const articleDescription = `Read ${data?.name}'s detailed interview experience as ${data?.role} at ${data?.company}.`;

  const profilePicUrl = data?.profile_pic || "/icon.png";

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
          datePublished: data?.date
            ? new Date(data.date).toISOString()
            : new Date().toISOString(),
          image: profilePicUrl,
          publisher: {
            "@type": "Organization",
            name: "theInterview",
            logo: {
              "@type": "ImageObject",
              url: "/icon.png",
            },
          },
          description: articleDescription,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
          },
        }}
      />

      <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100">
        <Navbar />
        <div className="relative mx-auto max-w-6xl px-3 pb-12 pt-20 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8">
          <div className="pointer-events-none absolute -left-20 top-28 h-64 w-64 rounded-full bg-blue-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />

          <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-3xl">
            <header className="relative border-b border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/70 px-4 py-5 pr-14 sm:px-8 sm:py-8 sm:pr-8 lg:px-10">
              <ShareButton id={id} data={data} />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md sm:h-28 sm:w-28">
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

                  <h1 className="mt-3 text-[22px] leading-tight font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    {data?.name}
                  </h1>

                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                    <UserRound size={15} className="text-slate-500" />
                    Candidate story from theInterview community
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
                    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <GraduationCap size={14} className="text-indigo-600" />
                      <span className="truncate">{data?.branch} {data?.batch}</span>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <Building2 size={14} className="text-indigo-600" />
                      <span className="truncate">{data?.company}</span>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <Briefcase size={14} className="text-indigo-600" />
                      <span className="truncate">{data?.role}</span>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <Eye size={14} className="text-indigo-600" />
                      <span className="truncate">{data?.views} Reads</span>
                    </div>
                  </div>

                  <time className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                    <CalendarDays size={14} className="text-slate-500" />
                    <span className="whitespace-normal">{data?.date ? formattedDate(data.date) : ""}</span>
                  </time>
                </div>
              </div>
            </header>

            <main className="px-4 py-5 sm:px-8 sm:py-7 lg:px-10">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <NotebookPen size={13} className="text-slate-500" />
                  Interview Experience Details
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Structured candidate walkthrough
                </span>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700">
                  <ListChecks size={14} className="text-indigo-600" />
                  Process Overview
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700">
                  <MessageSquareText size={14} className="text-indigo-600" />
                  Questions & Rounds
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700">
                  <BadgeCheck size={14} className="text-indigo-600" />
                  Final Outcome
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ScrollText size={15} className="text-slate-600" />
                    Detailed Breakdown
                  </span>
                </div>
                <div className="bg-white px-1 sm:px-2">
                  <div className="prose sm:prose-lg max-w-none text-slate-700">
                    <MarkdownRenderer content={data?.exp_text || ""} />
                  </div>
                </div>
              </div>
            </main>

            <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
              <p>Reads: {data?.views}</p>
              <p>Shared on theInterview community feed</p>
            </footer>
          </article>

          <section className="mt-10 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
                  <Layers3 size={22} className="text-indigo-600" />
                  Related Experiences
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Explore similar interview stories from other candidates.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {articles.length} posts
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.uid} article={article} />
              ))}
            </div>
          </section>
        </div>

        <div className="h-[20px]"></div>
      </div>

      <ScrollViewTracker id={id} />
    </>
  );
}
