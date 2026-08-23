import LandingPage from "@/components/Landing";
import { TALES_ENABLED } from "@/lib/feature-flags";
import { toPublicPost } from "@/lib/post-shape";
import { companySlugFromName } from "@/lib/companySlug";
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
    // Tales is hidden: skip the query entirely rather than fetch and drop it.
    if (!TALES_ENABLED) return [];
    try {
        const db = await getMongoDb();
        const [tales, legacyTales] = await Promise.all([
            db.collection("tales")
                .find({ content_type: "tale" })
                .sort({ date: -1, _id: -1 })
                .limit(30)
                .toArray(),
            db.collection("experience")
                .find({ content_type: "tale" })
                .sort({ date: -1, _id: -1 })
                .limit(30)
                .toArray(),
        ]);

        return [...new Map([...tales, ...legacyTales].map((tale) => [tale.uid || tale._id.toString(), tale])).values()]
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 30);
    } catch (error) {
        console.error("Fetching tales failed:", error);
        return [];
    }
}

/**
 * The "By company" chips were a hardcoded list that ALL linked to /companies --
 * clicking "Siemens" never opened Siemens. The names were stale too ("BNY",
 * "Arista"), so slugging them directly would 404. Resolve the real companies,
 * most-covered first, and hand the chips a genuine slug each.
 */
async function fetchTopCompanies() {
    // No Redis wrapper here on purpose: an Upstash REST fetch is a no-store fetch,
    // which would flip this whole page from prerendered to server-rendered.
    {
        try {
            const db = await getMongoDb();

            const grouped = await db
                .collection("experience")
                .aggregate([
                    { $match: { company: { $type: "string", $ne: "" } } },
                    { $group: { _id: { $toLower: "$company" }, name: { $first: "$company" }, count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 24 },
                ])
                .toArray();

            if (!grouped.length) return [];

            const slugs = grouped.map((group) => companySlugFromName(group.name)).filter(Boolean);
            const docs = await db
                .collection("companies")
                .find({ slug: { $in: slugs } }, { projection: { name: 1, slug: 1 } })
                .toArray();

            const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));

            // Only chips that resolve to a real company page survive.
            return grouped
                .map((group) => bySlug.get(companySlugFromName(group.name)))
                .filter(Boolean)
                .map((doc) => ({ name: doc.name, slug: doc.slug }))
                .slice(0, 8);
        } catch (error) {
            console.error("Fetching top companies failed:", error);
            return [];
        }
    }
}

async function fetchFeaturedStories() {
    try {
        const db = await getMongoDb();
        return await db
            .collection("experience")
            .find({ content_type: "interview" })
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
                    $match: { content_type: "interview" }
                },
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
    const [rawTales, rawFeaturedStories, rawTopStories, topCompanies] = await Promise.all([
        fetchTales(),
        fetchFeaturedStories(),
        fetchTopStories(),
        fetchTopCompanies(),
    ]);

    // Sanitize MongoDB documents for Client Components. toPublicPost also strips
    // the author email and the array of liker emails, which were previously
    // serialized straight into the RSC payload of the most-visited page, and
    // truncates the body -- the cards render two lines of it.
    const forCards = (docs) => JSON.parse(JSON.stringify(docs.map((doc) => toPublicPost(doc, { previewChars: 400 }))));

    const tales = forCards(rawTales);
    const featuredStories = forCards(rawFeaturedStories);
    const topStories = forCards(rawTopStories);

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
            <LandingPage tales={tales} featuredStories={featuredStories} topStories={topStories} topCompanies={topCompanies} />
        </>
    );
}
