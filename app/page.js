import LandingPage from "@/components/Landing";
import Script from "next/script";
import { getMongoDb } from "@/lib/mongodb";

// Revalidate home every 30 minutes.
export const revalidate = 1800;

const siteUrl = "https://theinterviewroom.in";

export const metadata = {
    title: "The Interview Room",
    description:
        "Read real interview experiences, company-specific insights, and prep resources to land your next role.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "The Interview Room",
        description:
            "Read real interview experiences, company-specific insights, and prep resources to land your next role.",
        url: siteUrl,
    },
    twitter: {
        title: "The Interview Room",
        description:
            "Read real interview experiences, company-specific insights, and prep resources to land your next role.",
    },
};

async function fetchTales() {
    try {
        const db = await getMongoDb();
        return await db
            .collection("experience")
            .find({ content_type: "tale" })
            .sort({ date: -1, _id: -1 })
            .limit(30)
            .toArray();
    } catch (error) {
        console.error("Fetching tales failed:", error);
        return [];
    }
}

async function fetchFeaturedStories() {
    try {
        const db = await getMongoDb();
        return await db
            .collection("experience")
            .find({})
            .sort({ date: -1, _id: -1 })
            .limit(30)
            .toArray();
    } catch (error) {
        console.error("Fetching featured stories failed:", error);
        return [];
    }
}

async function fetchTopStories() {
    try {
        const db = await getMongoDb();
        return await db
            .collection("experience")
            .aggregate([
                {
                    $addFields: {
                        viewsInt: {
                            $convert: {
                                input: { $ifNull: ["$views", 0] },
                                to: "int",
                                onError: 0,
                                onNull: 0,
                            },
                        },
                    },
                },
                { $sort: { viewsInt: -1, date: -1, _id: -1 } },
                { $limit: 30 },
                { $project: { viewsInt: 0 } },
            ])
            .toArray();
    } catch (error) {
        console.error("Fetching top stories failed:", error);
        return [];
    }
}


// This is a Server Component (default in app/)
export default async function Home() {
    const [tales, featuredStories, topStories] = await Promise.all([
        fetchTales(),
        fetchFeaturedStories(),
        fetchTopStories(),
    ]);

    return (
        <>
            <Script
                id="ld-json-website"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        name: "The Interview Room",
                        url: siteUrl,
                        potentialAction: {
                            "@type": "SearchAction",
                            target: `${siteUrl}/search?q={search_term_string}`,
                            "query-input": "required name=search_term_string",
                        },
                    }),
                }}
            />
            <Script
                id="ld-json-organization"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: "The Interview Room",
                        url: siteUrl,
                        logo: `${siteUrl}/app_icon.png`,
                    }),
                }}
            />
            <LandingPage tales={tales} featuredStories={featuredStories} topStories={topStories} />
        </>
    );
}
