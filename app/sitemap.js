import { MongoClient } from "mongodb";

export default async function sitemap() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db(process.env.MONGODB_DB_NAME);

  // 🔥 Fetch all posts (or interviews)
  const posts = await db.collection("experience").find({}).toArray();


  const postUrls = posts.map((post) => ({
    url: `https://pict.live/single/${post.uid}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://pict.live",
      lastModified: new Date(),
    },
    {
      url: "https://pict.live/feed",
      lastModified: new Date(),
    },
    ...postUrls, // 🔥 dynamic pages
  ];
}