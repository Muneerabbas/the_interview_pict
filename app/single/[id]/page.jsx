import MarkdownRenderer from "@/components/Markdown";
import { Metadata, ResolvingMetadata } from 'next/types';
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { Building2, GraduationCap, Briefcase, Eye } from "lucide-react";
import { JsonLd } from "react-schemaorg";
import ArticleCard from "@/components/ArticleCard";
import ShareButton from "@/components/ShareButton";
import ScrollViewTracker from "@/components/ScrollViewTracker";

// Define revalidation time (in seconds) for ISR
const revalidateTime = 3000; // Revalidate every 60 seconds (1 minute) - adjust as needed

export async function generateMetadata({ params }) {
  // Fetch data
  const id = params.id;
  const apiUrl = `https://www.pict.life/api/exp?uid=${id}`;
  const response = await fetch(apiUrl, { next: { revalidate: revalidateTime } });
  const data = await response.json();

  const articleUrl = `https://www.pict.life/single/${id}`;
  const articleDescription = `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}. Learn about the interview process, questions asked, and valuable insights for ${data.branch} students.`;

  return {
    title: 'theInterview🚀',
    description: "Share Your Interview Journey 🚀\nLearn from real experiences. Share your story. Help others succeed. ✨",
    keywords: `${data.company} Interview, ${data.role}, ${data.branch} Jobs, Interview Questions, ${data.batch} Placements, Technical Interview, Interview Tips, Career Advice, Job Interview Experience`,
    authors: [{ name: data.name }],
    openGraph: {
      title: 'theInterview🚀',
      description: "Share Your Interview Journey 🚀\nLearn from real experiences. Share your story. Help others succeed. ✨",
      url: articleUrl,
      siteName: 'theInterview',
      images: [
        {
          url: 'https://www.pict.life/icon.png',
          width: 1200,
          height: 630,
          alt: 'theInterview Logo',
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.company} Interview Experience: ${data.role} Position`,
      description: articleDescription,
      images: ['https://www.pict.life/icon.png'],
      creator: '@yourtwitter', // Replace with your Twitter handle
    },
    icons: {
      icon: [{ url: '/icon.png' }],
    },
    metadataBase: new URL('https://www.pict.life'),
  };
}


export default async function SimilarExperience({ params }) {
  if (!params || !params.id) {
    return <div className="text-center text-lg text-gray-600 mt-10">Invalid request</div>;
  }

  const { id } = params;
  let data = null;
  let articles = [];
  let feedArticles = [];
  let searchArticles = [];
  let expData = null;

  const formattedDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
  };

  try {
    const apiUrl = `https://www.pict.life/api/exp?uid=${id}`;
    const feedUrl = `https://www.pict.life/api/feed`;

    const [expResponse, feedResponse] = await Promise.all([
      fetch(apiUrl, { next: { revalidate: revalidateTime } }),
      fetch(feedUrl, { next: { revalidate: revalidateTime } }),
    ]);

    const expDataResponse = await expResponse.json();
    const feedDataResponse = await feedResponse.json();

    expData = expDataResponse;
    data = {
      ...expData,
      profile_pic: expData.profile_pic?.replace(/"/g, ""),
      name: expData.name?.replace(/"/g, ""),
      exp_text: expData.exp_text?.replace(/"/g, ""),
    };
    feedArticles = feedDataResponse;

    articles = [...feedArticles, ...searchArticles];
    articles = articles.filter((article) => article.uid !== id);
    articles = articles.filter((article, index) => articles.findIndex((a) => a.uid === article.uid) === index);


  } catch (error) {
    console.error("Error fetching data:", error);
    return <div className="text-center text-lg text-gray-600 mt-10">Failed to load experience.</div>;
  }

  const articleUrl = `https://www.pict.life/single/${id}`;
  const articleDescription = `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}. Learn about the interview process, questions asked, and valuable insights for ${data.branch} students.`;
  const profilePicUrl = data.profile_pic || `@/public/icon.png`;

  return (
    <>
      <JsonLd
        item={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${data.company} Interview Experience: ${data.role} Position`,
          author: {
            "@type": "Person",
            name: data.name,
          },
          datePublished: new Date(data.date).toISOString(),
          image: profilePicUrl,
          publisher: {
            "@type": "Organization",
            name: "PICT Life",
            logo: {
              "@type": "ImageObject",
              url: `https://www.pict.life/icon.png`
            }
          },
          description: articleDescription,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl
          }
        }}
      />

      <Navbar />
      <article className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 bg-white text-gray-800 py-10 sm:py-12 lg:py-16 mt-20 sm:mt-24 lg:mt-28 overflow-x-hidden">
        {/* Profile Info Section (no changes) */}
        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-10 relative">
          {/* ShareButton inside the profile (no changes) */}
          <ShareButton
            id={id}
            data={data}
          />

          {/* Profile Image (no changes) */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0">
            <img
              src={data.profile_pic || "/api/placeholder/80/80"}
              alt={`${data.name}'s profile picture`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Profile Info (no changes) */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              {data.name}
            </h1>

            {/* Info Grid (no changes) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <GraduationCap size={16} className="text-blue-600" aria-hidden="true" />
                <span className="truncate">{data.branch} {data.batch}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 size={16} className="text-blue-600" aria-hidden="true" />
                <span className="truncate">{data.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase size={16} className="text-blue-600" aria-hidden="true" />
                <span className="truncate">{data.role}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} className="text-blue-600" aria-hidden="true" />
                <span>{data.views} Reads</span>
              </div>
            </div>

            {/* Date (no changes) */}
            <time dateTime={new Date(data.date).toISOString()} className="text-sm text-gray-500">
              {formattedDate(data.date)}
            </time>
          </div>
        </header>

        <div className="border-t border-gray-300 my-6"></div>

        {/* Main content (no changes) */}
        <main className="mb-10">
          <div className="prose prose-lg max-w-none text-base text-gray-700">
            <MarkdownRenderer content={data.exp_text} />
          </div>
        </main>

        <footer className="text-center text-sm text-gray-500 pt-5 border-t border-gray-200">
          <p>Reads: {data.views}</p>
        </footer>

        {/* Related Articles (no changes) */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-[#1D1D1D] mb-6">Related Experiences</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.uid} article={article} />
            ))}
          </div>
        </section>
      </article>
      <div className='h-[30px]'></div>
      <ScrollViewTracker id = {id} />
    </>
  );
}