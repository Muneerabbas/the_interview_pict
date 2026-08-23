import { TALES_ENABLED } from "@/lib/feature-flags";

export const metadata = {
  title: TALES_ENABLED ? "Student Tales, Projects & Hackathon Stories" : "Tales - Coming soon",
  // Nothing to index while the page is a placeholder.
  robots: TALES_ENABLED ? undefined : { index: false, follow: true },
  description:
    "Read authentic student stories about hackathons, projects, internships, competitions, startups, open source, and placement journeys.",
  alternates: {
    canonical: "/tales",
  },
  openGraph: {
    title: "Student Tales, Projects & Hackathon Stories | The Interview Room",
    description:
      "Discover real student stories, project journeys, hackathon lessons, and career milestones.",
    url: "https://theinterviewroom.in/tales",
  },
};

export default function TalesLayout({ children }) {
  return children;
}
