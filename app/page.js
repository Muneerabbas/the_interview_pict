import HomePageClient from "@/components/home/HomePageClient";
import { SITE_URL } from "@/lib/server/config";

export const dynamic = "force-dynamic";

const revalidateTime = 1800;

async function fetchFeaturedStories() {
  const itemsPerPage = "30";
  try {
    const response = await fetch(
      `${SITE_URL}/api/feed?itemsPerPage=${itemsPerPage}`,
      {
        next: { revalidate: revalidateTime },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Fetching featured stories failed:", error);
    return [];
  }
}

async function fetchTopStories() {
  try {
    const response = await fetch(`${SITE_URL}/api/topStories`, {
      next: { revalidate: revalidateTime },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Fetching top stories failed:", error);
    return [];
  }
}

export default async function Home() {
  const featuredStories = await fetchFeaturedStories();
  const topStories = await fetchTopStories();

  return <HomePageClient featuredStories={featuredStories} topStories={topStories} />;
}
