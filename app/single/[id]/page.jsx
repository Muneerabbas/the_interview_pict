import axios from "axios";
import MarkdownRenderer from "@/components/Markdown";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { Building2, GraduationCap, Briefcase, Eye } from "lucide-react";
import { JsonLd } from "react-schemaorg";
import ArticleCard from "@/components/ArticleCard";
import ShareButton from "@/components/ShareButton";

export default async function SimilarExperience({ params }) {
  if (!params || !params.id) {
    return <div className="text-center text-lg text-gray-600 mt-10">Invalid request</div>;
  }

  const { id } = await params;
  let data = null;
  let articles = [];

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
    const apiUrl = `https://pict.life/api/exp?uid=${id}`;
    const response = await axios.get(apiUrl);
    data = {
      ...response.data,
      profile_pic: response.data.profile_pic?.replace(/"/g, ""),
      name: response.data.name?.replace(/"/g, ""),
      exp_text: response.data.exp_text?.replace(/"/g, ""),
    };

    const feedUrl = `${process.env.BASE_URL}/api/feed`;
    const searchFeed = `${process.env.BASE_URL}/api/search/${data.company} ${data.branch}`;
    const feedResponse = await axios.get(feedUrl);
    const searchResponse = await axios.get(feedUrl);
    articles = feedResponse.data;

    articles = [...articles, ...searchResponse.data];
    articles = articles.filter((article) => article.uid !== id);
    articles = articles.filter((article, index) => articles.findIndex((a) => a.uid === article.uid) === index);
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div className="text-center text-lg text-gray-600 mt-10">Failed to load experience.</div>;
  }

  const articleUrl = `${process.env.BASE_URL}/single/${id}`;
  const articleDescription = `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}. Learn about the interview process, questions asked, and valuable insights for ${data.branch} students.`;

  return (
    <>
      <Head>
        <title>{`${data.company} Interview Experience: ${data.role} Position | ${data.name}'s Journey`}</title>
        <meta name="description" content={articleDescription} />
        <meta name="keywords" content={`${data.company} Interview, ${data.role}, ${data.branch} Jobs, Interview Questions, ${data.batch} Placements, Technical Interview, Interview Tips, Career Advice, Job Interview Experience`} />
        <meta name="author" content={data.name} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`${data.company} Interview Experience: ${data.role} Position | ${data.name}'s Journey`} />
        <meta property="og:description" content={articleDescription} />
        <meta property="og:image" content={data.profile_pic} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:site_name" content="PICT Life" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${data.company} Interview Experience: ${data.role} Position`} />
        <meta name="twitter:description" content={articleDescription} />
        <meta name="twitter:image" content={data.profile_pic} />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={articleUrl} />
        
        {/* Article specific metadata */}
        <meta property="article:published_time" content={new Date(data.date).toISOString()} />
        <meta property="article:section" content="Interview Experiences" />
        <meta property="article:tag" content={`${data.company}, ${data.role}, ${data.branch}`} />
      </Head>

      {/* JSON-LD structured data */}
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
          image: data.profile_pic,
          publisher: {
            "@type": "Organization",
            name: "PICT Life",
            logo: {
              "@type": "ImageObject",
              url: "process.env.BASE_URL/logo.png"
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
        {/* Profile Info Section */}
        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-10 relative">
        {/* ShareButton inside the profile */}

        <ShareButton 
            id={id} 
            data={data}
          />
        
          
          {/* Profile Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-md flex-shrink-0">
            <img
              src={data.profile_pic || "/api/placeholder/80/80"}
              alt={`${data.name}'s profile picture`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              {data.name}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <GraduationCap size={16} className="text-blue-600" aria-hidden="true" />
                <span className="truncate">{data.branch}</span>
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
                <span>{data.views} views</span>
              </div>
            </div>

            {/* Date */}
            <time dateTime={new Date(data.date).toISOString()} className="text-sm text-gray-500">
              {formattedDate(data.date)}
            </time>
          </div>
        </header>

        <div className="border-t border-gray-300 my-6"></div>

        {/* Main content */}
        <main className="mb-10">
          <div className="prose prose-lg max-w-none text-base text-gray-700">
            <MarkdownRenderer content={data.exp_text} />
          </div>
        </main>

        <footer className="text-center text-sm text-gray-500 pt-5 border-t border-gray-200">
          <p>Views: {data.views}</p>
        </footer>

        {/* Related Articles */}
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
    </>
  );
}
