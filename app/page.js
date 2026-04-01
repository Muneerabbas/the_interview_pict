// app/page.js
import LandingPage from '@/components/Landing';
import { getServerOrigin } from "@/lib/serverOrigin";

// Define revalidation time (in seconds) for ISR
const revalidateTime = 1800;

// Fetch Featured Stories function (reusable)
async function fetchFeaturedStories(baseUrl) {
    const itemsPerPage = '30';
    try {
        const response = await fetch(`${baseUrl}/api/feed?itemsPerPage=${itemsPerPage}`, {
            next: { revalidate: revalidateTime }, // Enable ISR for this fetch
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetching featured stories failed:", error);
        return []; // Return empty array in case of error
    }
}

// Fetch Top Stories function (reusable)
async function fetchTopStories(baseUrl) {
    try {
        const response = await fetch(`${baseUrl}/api/topStories`, {
            next: { revalidate: revalidateTime }, // Enable ISR for this fetch
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetching top stories failed:", error);
        return []; // Return empty array in case of error
    }
}


// This is a Server Component (default in app/)
export default async function Home() {
    const baseUrl = await getServerOrigin();
    // Fetch data directly in the Server Component
    const featuredStories = await fetchFeaturedStories(baseUrl);
    const topStories = await fetchTopStories(baseUrl);

    return (
        <LandingPage featuredStories={featuredStories} topStories={topStories} />
    );
}
