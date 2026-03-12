import MarkdownRenderer from "@/components/Markdown";
import { Metadata } from "next/types";
import Navbar from "@/components/Navbar";
import { Building2, GraduationCap, Briefcase, Eye } from "lucide-react";
import { JsonLd } from "react-schemaorg";
import ArticleCard from "@/components/ArticleCard";
import ShareButton from "@/components/ShareButton";
import ScrollViewTracker from "@/components/ScrollViewTracker";
import ProfileAvatar from "@/components/ProfileAvatar";

const revalidateTime = 3000;
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.the-interview.co.in";
export async function generateMetadata({ params }) {
  const { id } = await params;

  const baseUrl = "https://www.the-interview.co.in";

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
      <div className="text-center text-lg text-gray-600 mt-10">
        Invalid request
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
      <div className="text-center text-lg text-gray-600 mt-10">
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

      <Navbar />

      <article className="max-w-3xl mx-auto px-6 bg-white text-gray-800 py-12 mt-24">
        <header className="flex flex-col sm:flex-row gap-6 mb-10 relative">
          <ShareButton id={id} data={data} />

          <div className="w-24 h-24 rounded-full overflow-hidden border">
            <ProfileAvatar
              src={data?.profile_pic}
              alt={`${data?.name}'s profile picture`}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {data?.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <GraduationCap size={16} />
                {data?.branch} {data?.batch}
              </div>

              <div className="flex items-center gap-1">
                <Building2 size={16} />
                {data?.company}
              </div>

              <div className="flex items-center gap-1">
                <Briefcase size={16} />
                {data?.role}
              </div>

              <div className="flex items-center gap-1">
                <Eye size={16} />
                {data?.views} Reads
              </div>
            </div>

            <time className="text-sm text-gray-500">
              {data?.date ? formattedDate(data.date) : ""}
            </time>
          </div>
        </header>

        <div className="border-t border-gray-300 my-6"></div>

        <main className="mb-10">
          <div className="prose prose-lg max-w-none text-gray-700">
            <MarkdownRenderer content={data?.exp_text || ""} />
          </div>
        </main>

        <footer className="text-center text-sm text-gray-500 pt-5 border-t">
          <p>Reads: {data?.views}</p>
        </footer>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-6">
            Related Experiences
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.uid} article={article} />
            ))}
          </div>
        </section>
      </article>

      <div className="h-[30px]"></div>

      <ScrollViewTracker id={id} />
    </>
  );
}