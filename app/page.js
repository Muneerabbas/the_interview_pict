// app/page.js
import LandingPage from '@/components/Landing';

// Define revalidation time (in seconds) for ISR
const revalidateTime = 300; // Revalidate every 60 seconds (1 minute) for ISR

// Fetch Featured Stories function (reusable)
async function fetchFeaturedStories() {
    const itemsPerPage = 6;
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/feed?itemsPerPage=${itemsPerPage}`, {
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
async function fetchTopStories() {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/topStories`, {
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
    // Fetch data directly in the Server Component
    const featuredStories = await fetchFeaturedStories();
    const topStories = await fetchTopStories();

    return (
        <LandingPage featuredStories={featuredStories} topStories={topStories} />
    );
}