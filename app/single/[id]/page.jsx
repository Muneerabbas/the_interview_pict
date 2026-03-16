import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScrollViewTracker from "@/components/ScrollViewTracker";
import ShareButton from "@/components/ShareButton";
import MarkdownRenderer from "@/components/Markdown";
import SafeOptionalImage from "@/components/SafeOptionalImage";
import { JsonLd } from "react-schemaorg";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Info,
  Lightbulb,
  MessageCircle,
  User,
} from "lucide-react";
import { SITE_URL } from "@/lib/server/config";

export const dynamic = "force-dynamic";

const revalidateTime = 3000;
const baseUrl = SITE_URL;

function cleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/"/g, "").trim();
  return normalized || fallback;
}

function hasImage(value) {
  const url = cleanText(value);
  if (!url) return false;
  if (url.includes("api/placeholder")) return false;
  return true;
}

function pickValidUidItem(item) {
  return item && typeof item.uid === "string" && item.uid.trim().length > 0;
}

function formatDate(dateValue) {
  if (!dateValue) return "Date unavailable";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function estimateReadTime(content) {
  const words = cleanText(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function getPreparationTips(company, role) {
  const generic = [
    "Prepare one strong project deep-dive with architecture and trade-offs.",
    "Practice communicating your thought process before jumping to final answers.",
    "Revise CS fundamentals: DBMS, OOP, networking, and OS basics.",
  ];

  const key = `${company} ${role}`.toLowerCase();
  if (key.includes("barclays")) {
    return [
      "Focus on SQL joins, indexing, and transaction/ACID questions.",
      "Expect project deep-dives and trade-off reasoning during technical rounds.",
      "Prepare situational examples for values and behavioral discussions.",
    ];
  }

  if (key.includes("frontend")) {
    return [
      "Revise rendering, state management, and performance optimization patterns.",
      "Practice low-level UI design and component architecture trade-offs.",
      "Be ready to explain browser behavior and debugging strategy.",
    ];
  }

  if (key.includes("sde") || key.includes("software")) {
    return [
      "Practice medium-level DSA with clear complexity reasoning.",
      "Prepare one system design problem with scaling decisions.",
      "Expect follow-ups around code quality and production readiness.",
    ];
  }

  return generic;
}

function getCompanyInfo(company) {
  const key = cleanText(company).toLowerCase();
  if (key.includes("barclays")) {
    return {
      summary:
        "Barclays is a British universal bank with strong presence in investment banking, markets, and technology operations.",
      industry: "Investment Banking",
      headquarters: "London, UK",
      employees: "80,000+",
    };
  }

  return {
    summary:
      "Company information is based on publicly known details and community submissions.",
    industry: "Technology / Services",
    headquarters: "Global",
    employees: "Not disclosed",
  };
}

export async function generateMetadata({ params }) {
  const { id } = await params;

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
    title: `${cleanText(data?.company, "theInterview")} Interview Experience`,
    description: `Read ${cleanText(data?.name, "a candidate")}'s interview experience at ${cleanText(data?.company, "a company")}.`,
    metadataBase: new URL(baseUrl),
  };
}

export default async function ExperienceViewer({ params }) {
  const { id } = await params;

  if (!id) {
    return <div className="mt-10 text-center text-lg text-gray-600">Invalid request</div>;
  }

  let data = null;
  let related = [];

  try {
    const [expResponse, feedResponse] = await Promise.all([
      fetch(`${baseUrl}/api/exp?uid=${id}`, { next: { revalidate: revalidateTime } }),
      fetch(`${baseUrl}/api/feed?itemsPerPage=30`, { next: { revalidate: revalidateTime } }),
    ]);

    const expDataResponse = expResponse.ok ? await expResponse.json() : null;
    const expData = expDataResponse?.value ?? expDataResponse;
    const feedData = feedResponse.ok ? await feedResponse.json() : [];

    data = expData
      ? {
          ...expData,
          profile_pic: cleanText(expData?.profile_pic),
          name: cleanText(expData?.name, "Anonymous"),
          exp_text: cleanText(expData?.exp_text),
          company: cleanText(expData?.company, "Unknown Company"),
          role: cleanText(expData?.role, "Role not specified"),
          branch: cleanText(expData?.branch),
          batch: cleanText(expData?.batch),
        }
      : null;

    related = Array.isArray(feedData)
      ? feedData
          .filter((item) => pickValidUidItem(item) && item.uid !== id)
          .slice(0, 5)
      : [];
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="mx-auto mt-20 max-w-3xl rounded-xl border border-slate-700 bg-slate-900/60 p-8 text-center text-slate-300">
          Failed to load this experience.
        </div>
      </>
    );
  }

  const articleUrl = `${baseUrl}/single/${id}`;
  const articleDescription = `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}.`;
  const companyInfo = getCompanyInfo(data.company);
  const tips = getPreparationTips(data.company, data.role);
  const readTime = estimateReadTime(data.exp_text);
  const coverImage = cleanText(data?.cover_image || data?.banner || data?.profile_pic);
  const authorImage = cleanText(data?.profile_pic);

  return (
    <>
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${data.company} Interview Experience: ${data.role}`,
          author: {
            "@type": "Person",
            name: data.name,
          },
          datePublished: data?.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          ...(hasImage(data.profile_pic) ? { image: data.profile_pic } : {}),
          publisher: {
            "@type": "Organization",
            name: "theInterview",
          },
          description: articleDescription,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
          },
        }}
      />

      <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
        <Navbar />

        <main className="flex flex-1 justify-center px-4 py-8 md:px-20">
          <div className="grid w-full max-w-[1200px] grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <nav className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" href="/">Home</Link>
                <span>/</span>
                <Link className="hover:text-primary" href="/feed">Experiences</Link>
                <span>/</span>
                <span className="font-medium text-slate-900 dark:text-white">{data.company} {data.role}</span>
              </nav>

              <article className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                  <SafeOptionalImage
                    src={coverImage}
                    alt={`${data.company} interview cover`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                      {data.role} Interview Experience
                    </h1>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-white p-2 shadow-sm dark:bg-slate-900">
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
                          {data.company.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{data.company}</h2>
                          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-green-500">
                            Shared
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {data.branch || "Branch N/A"}{data.batch ? ` • ${data.batch}` : ""} • {formatDate(data.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        {hasImage(authorImage) ? (
                          <SafeOptionalImage
                            src={authorImage}
                            alt="Author profile"
                            className="h-full w-full object-cover"
                            fallback={<User size={16} className="text-slate-500 dark:text-slate-300" />}
                          />
                        ) : (
                          <User size={16} className="text-slate-500 dark:text-slate-300" />
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
                        <p className="text-slate-500 dark:text-slate-400">{readTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 dark:bg-slate-900">
                        <Briefcase size={14} /> {data.role}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 dark:bg-slate-900">
                        <Building2 size={14} /> {data.company}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 dark:bg-slate-900">
                        <Eye size={14} /> {Number(data.views) || 0} views
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 dark:bg-slate-900">
                        <CalendarDays size={14} /> {formatDate(data.date)}
                      </span>
                    </div>
                    <ShareButton id={id} data={data} />
                  </div>

                  <article className="prose prose-slate max-w-none dark:prose-invert">
                    <MarkdownRenderer content={data.exp_text || "No interview details available."} />
                  </article>

                  <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
                        <MessageCircle size={16} className="text-primary" />
                        <span className="text-sm font-semibold">{Math.max(1, Math.floor((Number(data.views) || 0) / 8))}</span>
                      </button>
                    </div>
                    <Link href="/feed" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90">
                      <span className="text-sm font-semibold">Back to Feed</span>
                    </Link>
                  </div>
                </div>
              </article>
            </div>

            <aside className="flex flex-col gap-8 lg:col-span-4">
              <section className="rounded-xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-800/50">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Info size={18} className="text-primary" />
                  About {data.company}
                </h4>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{companyInfo.summary}</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Industry</span>
                    <span className="font-medium">{companyInfo.industry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Headquarters</span>
                    <span className="font-medium">{companyInfo.headquarters}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Employees</span>
                    <span className="font-medium">{companyInfo.employees}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-800/50">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Lightbulb size={18} className="text-primary" />
                  Preparation Tips
                </h4>
                <ul className="space-y-4">
                  {tips.map((tip) => (
                    <li key={tip} className="flex gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                      <p className="text-sm text-slate-600 dark:text-slate-300">{tip}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-800/50">
                <h4 className="mb-4 text-lg font-bold">Related Experiences</h4>
                <div className="space-y-4">
                  {related.length > 0 ? (
                    related.map((item) => (
                      <Link key={item.uid} className="group block" href={`/single/${item.uid}`}>
                        <p className="text-sm font-bold transition-colors group-hover:text-primary">
                          {cleanText(item?.company, "Company")} - {cleanText(item?.role, "Role")}
                        </p>
                        <p className="text-xs text-slate-500">by {cleanText(item?.name, "Candidate")} • {formatDate(item?.date)}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No related experiences available.</p>
                  )}
                </div>
                <Link href="/feed" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">
                  View All Related
                </Link>
              </section>
            </aside>
          </div>
        </main>

        <ScrollViewTracker id={id} />
      </div>
    </>
  );
}
