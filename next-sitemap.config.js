/** @type {import('next-sitemap').IConfig} */
const { MongoClient } = require("mongodb");

async function getDynamicContentPaths() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB_NAME) {
    console.warn("Dynamic sitemap paths skipped: MongoDB environment variables are unavailable.");
    return [];
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    readPreference: "secondaryPreferred",
    maxStalenessSeconds: 90,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const [interviews, tales, legacyTales, companies] = await Promise.all([
      db.collection("experience").find(
        { content_type: "interview", uid: { $type: "string", $ne: "" } },
        { projection: { uid: 1, date: 1 } }
      ).toArray(),
      db.collection("tales").find(
        { uid: { $type: "string", $ne: "" } },
        { projection: { uid: 1, date: 1 } }
      ).toArray(),
      db.collection("experience").find(
        { content_type: "tale", uid: { $type: "string", $ne: "" } },
        { projection: { uid: 1, date: 1 } }
      ).toArray(),
      db.collection("companies").find(
        { slug: { $type: "string", $ne: "" } },
        { projection: { slug: 1, updatedAt: 1, createdAt: 1 } }
      ).toArray(),
    ]);

    const postPaths = new Map();
    [...interviews, ...tales, ...legacyTales].forEach((post) => {
      if (!post.uid || postPaths.has(post.uid)) return;
      postPaths.set(post.uid, {
        loc: `/single/${encodeURIComponent(post.uid)}`,
        lastmod: post.date || undefined,
        changefreq: "weekly",
        priority: 0.7,
      });
    });

    return [
      ...postPaths.values(),
      ...companies.map((company) => ({
        loc: `/companies/${encodeURIComponent(company.slug)}`,
        lastmod: company.updatedAt || company.createdAt || undefined,
        changefreq: "weekly",
        priority: 0.7,
      })),
    ];
  } catch (error) {
    console.warn("Dynamic sitemap paths unavailable:", error?.message || error);
    return [];
  } finally {
    await client.close().catch(() => {});
  }
}

module.exports = {
  siteUrl: "https://theinterviewroom.in",
  generateRobotsTxt: true,
  additionalPaths: getDynamicContentPaths,
  exclude: [
    "/login",
    "/profile",
    "/post",
    "/post/*",
    "/add-company",
    "/edit",
    "/edit-company",
    "/search/*",
    "/simple",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/profile",
          "/post",
          "/add-company",
          "/edit",
          "/edit-company",
          "/search",
          "/simple",
        ],
      },
    ],
  },
};
