import Head from 'next/head';
import Link from 'next/link'; // Import Link

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col justify-center items-center bg-white text-black">
      <Head>
        <title>PICT Interview Experience - Prepare for Your Next Interview</title>
        <meta name="description" content="Get insights into the PICT interview process, tips, and experiences shared by alumni. Prepare effectively for your next interview with our comprehensive guide." />
        <meta name="keywords" content="PICT interview, PICT interview experience, PICT placement, interview tips, PICT alumni" />
        <meta name="author" content="Your Name" />
        <link rel="canonical" href="https://www.yourwebsite.com/pict-interview-experience" />
      </Head>

      <main className="py-20 flex flex-col justify-center items-center flex-1">
        <h1 className="text-4xl font-semibold text-center leading-tight mb-4">
          PICT Interview Experience
        </h1>

        <p className="text-lg text-center leading-7 mb-12">
          Insights, Tips, and Experiences from PICT Alumni
        </p>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mt-12">
          <Link href="/home" className="p-6 text-left text-black border border-gray-200 rounded-xl hover:text-blue-600 hover:border-blue-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Overview &rarr;</h2>
            <p className="text-lg">Get a comprehensive overview of the PICT interview process.</p>
          </Link>

          <Link href="/home" className="p-6 text-left text-black border border-gray-200 rounded-xl hover:text-blue-600 hover:border-blue-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Interview Tips &rarr;</h2>
            <p className="text-lg">Learn valuable tips to ace your PICT interview.</p>
          </Link>

          <Link href="/home" className="p-6 text-left text-black border border-gray-200 rounded-xl hover:text-blue-600 hover:border-blue-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Alumni Experiences &rarr;</h2>
            <p className="text-lg">Read real experiences shared by PICT alumni.</p>
          </Link>

          <Link href="/home" className="p-6 text-left text-black border border-gray-200 rounded-xl hover:text-blue-600 hover:border-blue-600 transition-colors">
            <h2 className="text-xl font-semibold mb-4">Resources &rarr;</h2>
            <p className="text-lg">Access curated resources to prepare effectively.</p>
          </Link>
        </div>
      </main>

      <footer className="w-full h-24 border-t border-gray-200 flex justify-center items-center">
        <p className="text-base m-0">
          © 2025 The Interview PICT Life. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
