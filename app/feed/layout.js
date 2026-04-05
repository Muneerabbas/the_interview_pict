export const metadata = {
  title: "Interview Feed",
  description:
    "Explore the latest interview experiences and preparation insights shared by the community.",
  alternates: {
    canonical: "/feed",
  },
  openGraph: {
    title: "Interview Feed | The Interview Room",
    description:
      "Explore the latest interview experiences and preparation insights shared by the community.",
    url: "https://theinterviewroom.in/feed",
  },
};

export default function FeedLayout({ children }) {
  return children;
}
