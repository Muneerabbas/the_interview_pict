import LandingPage from '@/components/Landing';
import { getMongoDb } from "@/lib/mongodb";

// Revalidate home every 30 minutes.
export const revalidate = 1800;

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
    const [featuredStories, topStories] = await Promise.all([
        fetchFeaturedStories(),
        fetchTopStories(),
    ]);

    return (
        <LandingPage featuredStories={featuredStories} topStories={topStories} />
    );
}
