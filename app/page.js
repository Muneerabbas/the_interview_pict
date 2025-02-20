// app/page.js
import LandingPage from '@/components/Landing';

// Define revalidation time (in seconds) for ISR
const revalidateTime = 1800; 

// Fetch Featured Stories function (reusable)
async function fetchFeaturedStories() {
    const itemsPerPage = '30';
    try {
        const response = await fetch(`https://www.pict.life/api/feed?itemsPerPage=${itemsPerPage}`, {
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
        const response = await fetch(`https://www.pict.life/api/topStories`, {
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