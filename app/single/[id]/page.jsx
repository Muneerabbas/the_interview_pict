import MarkdownRenderer from "@/components/Markdown";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { Building2, GraduationCap, Briefcase, Eye } from "lucide-react";
import { JsonLd } from "react-schemaorg";
import ArticleCard from "@/components/ArticleCard";
import ShareButton from "@/components/ShareButton";

// Define revalidation time (in seconds) for ISR
const revalidateTime = 60; // Revalidate every 60 seconds (1 minute) - adjust as needed

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
      fetch(apiUrl, { next: { revalidate: revalidateTime } }), // Enable ISR for apiUrl
      fetch(feedUrl, { next: { revalidate: revalidateTime } }), // Enable ISR for feedUrl
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

     // --- Send request to backend for view count ---
     try {
      const viewCountUrl = `https://www.pict.life/api/exp?uid=${id}`; // Replace with your actual backend endpoint for view count
      await fetch(viewCountUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }), // Send the article ID to the backend
      });
      // Optionally handle success or further actions here
    } catch (viewCountError) {
      console.error("Error sending view count to backend:", viewCountError);
    
    }
    


  } catch (error) {
    console.error("Error fetching data:", error);
    return <div className="text-center text-lg text-gray-600 mt-10">Failed to load experience.</div>;
  }

  console.log("process.env.BASE_URL:", process.env.BASE_URL);
  const articleUrl = `https://www.pict.life/single/${id}`;
  const articleDescription = `Read ${data.name}'s detailed interview experience as ${data.role} at ${data.company}. Learn about the interview process, questions asked, and valuable insights for ${data.branch} students.`;
  const profilePicUrl = data.profile_pic || `@/public/logo.svg`; // Fallback image if profile_pic is missing

  return (
    <>
      <Head>
        <title>{`${data.company} Interview Experience: ${data.role} Position | ${data.name}'s Journey`}</title>
        <meta name="description" content={articleDescription} />
        <meta name="keywords" content={`${data.company} Interview, ${data.role}, ${data.branch} Jobs, Interview Questions, ${data.batch} Placements, Technical Interview, Interview Tips, Career Advice, Job Interview Experience`} />
        <meta name="author" content={data.name} />

        {/* Add preconnect link */}
        <link rel="preconnect" href={process.env.BASE_URL} />

        {/* Open Graph tags */}
        <meta property="og:title" content={`${data.company} Interview Experience: ${data.role} Position | ${data.name}'s Journey`} />
        <meta property="og:description" content={articleDescription} />
        <meta property="og:image" content={profilePicUrl} />
        <meta property="og:image:alt" content={`${data.name}'s Profile Picture`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:site_name" content="PICT Life" />
        {/* Add width and height of the image for better rendering (optional, but recommended) */}
        {/* <meta property="og:image:width" content="1200" /> */}
        {/* <meta property="og:image:height" content="630" /> */}

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${data.company} Interview Experience: ${data.role} Position`} />
        <meta name="twitter:description" content={articleDescription} />
        <meta name="twitter:image" content={profilePicUrl} />
        <meta name="twitter:image:alt" content={`${data.name}'s Profile Picture`} />
        <meta name="twitter:site" content="@PICTLifeOfficial" /> {/* Replace with your twitter site handle */}
        <meta name="twitter:creator" content="@PICTLifeOfficial" /> {/* Replace with your twitter creator handle or author's handle if available */}


        {/* LinkedIn Post Sharing (LinkedIn uses Open Graph tags) - No specific LinkedIn tags needed here */}

        {/* Pinterest Rich Pins (Pinterest uses Open Graph and Schema.org) - Already covered by Open Graph and JSON-LD */}

        {/* Facebook Sharing (Facebook uses Open Graph tags) - Already covered by Open Graph */}

        {/* Additional SEO tags (already present) */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={articleUrl} />

        {/* Article specific metadata (already present) */}
        <meta property="article:published_time" content={new Date(data.date).toISOString()} />
        <meta property="article:section" content="Interview Experiences" />
        <meta property="article:tag" content={`${data.company}, ${data.role}, ${data.branch}`} />
      </Head>

      {/* JSON-LD structured data (no changes) */}
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
              url: `https://www.pict.life/logo.svg`
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
    </>
  );
}