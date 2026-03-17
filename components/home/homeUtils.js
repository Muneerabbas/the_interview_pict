export function normalizeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const next = value.trim();
  return next || fallback;
}

export function summarizeExperience(value, limit = 140) {
  const plain = normalizeText(value)
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "Read this interview breakdown and preparation insights.";
  return plain.length > limit ? `${plain.slice(0, limit)}...` : plain;
}

export function formatCount(value) {
  const count = Number(value) || 0;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export function difficultyLabel(item) {
  const views = Number(item?.views) || 0;
  if (views > 1500) return { text: "Hard", className: "text-red-500 border-red-500/20 bg-red-500/10" };
  if (views > 500) return { text: "Medium", className: "text-orange-500 border-orange-500/20 bg-orange-500/10" };
  return { text: "Easy", className: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" };
}

export function buildUniqueStories(topStories = [], featuredStories = []) {
  const map = new Map();
  [...topStories, ...featuredStories].forEach((item) => {
    const uid = normalizeText(item?.uid);
    if (uid && !map.has(uid)) {
      map.set(uid, item);
    }
  });
  return Array.from(map.values());
}

export function topCompanies(stories, limit = 5) {
  const counts = new Map();
  stories.forEach((item) => {
    const company = normalizeText(item?.company);
    if (!company) return;
    counts.set(company, (counts.get(company) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

export function communityStories(stories, limit = 3) {
  return stories.slice(0, limit).map((item) => ({
    uid: normalizeText(item?.uid),
    quote: summarizeExperience(item?.exp_text, 180),
    author: normalizeText(item?.name, "Anonymous Candidate"),
    role: normalizeText(item?.role, "Candidate"),
    company: normalizeText(item?.company, "Unknown Company"),
    batch: normalizeText(item?.batch || item?.year || item?.graduation_year, "N/A"),
    views: Number(item?.views) || 0,
    avatar: normalizeText(item?.profile_pic),
  }));
}
