import { MongoClient } from "mongodb";

const siteUrl = "https://theinterviewroom.in";

export default async function sitemap() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db(process.env.MONGODB_DB_NAME);

  const posts = await db.collection("experience").find({}).toArray();
  const companies = await db.collection("companies").find({}).toArray();

  const postUrls = posts.map((post) => ({
    url: `${siteUrl}/single/${post.uid}`,
    lastModified: post?.updatedAt || post?.date || post?.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const companyUrls = companies.map((company) => ({
    url: `${siteUrl}/companies/${company.slug}`,
    lastModified: company?.updatedAt || company?.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/team`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...companyUrls,
    ...postUrls,
  ];
}
