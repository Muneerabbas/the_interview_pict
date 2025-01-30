import axios from "axios";
import MarkdownRenderer from "@/components/Markdown";
import Head from "next/head";

export default async function InterviewExperience({ params }) {
  if (!params || !params.id) {
    return <div style={styles.loading}>Invalid request</div>;
  }

  const { id } = await params;
  let data = null;
  let articles = [];

  try {
    const apiUrl = `http://localhost:3000/api/exp?uid=${id}`;
    const response = await axios.get(apiUrl);
    data = {
      ...response.data,
      profile_pic: response.data.profile_pic?.replace(/"/g, ""),
      name: response.data.name?.replace(/"/g, ""),
      exp_text: response.data.exp_text?.replace(/"/g, ""),
    };

    // Fetch other articles from /feed
    const feedUrl = "http://localhost:3000/api/feed";
    const searchFeed = `http://localhost:3000/api/search/${data.company} ${data.role} ${data.batch} ${data.branch}`;
    const feedResponse = await axios.get(feedUrl);
    const searchResponse = await axios.get(feedUrl);
    articles = feedResponse.data;
   
    //add 
    articles = [...articles, ...searchResponse.data];

    articles = articles.filter((article) => article.uid !== id);
    //remove duplicate articles
    articles = articles.filter((article, index) => {
      const uid = article.uid;
      return articles.findIndex((a) => a.uid === uid) === index;
    })
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div style={styles.loading}>Failed to load experience.</div>;
  }

  return (
    <>
      <Head>
        <title>{`${data.name}'s Interview Experience at ${data.company}`}</title>
        <meta
          name="description"
          content={`${data.name} shares their experience interviewing for ${data.role} at ${data.company}. Insights from the ${data.batch} batch.`}
        />
        <meta
          name="keywords"
          content={`Interview Experience, ${data.company}, ${data.role}, ${data.batch}, ${data.branch}`}
        />
        <meta name="author" content={data.name} />
        <meta property="og:title" content={`${data.name}'s Interview Experience at ${data.company}`} />
        <meta
          property="og:description"
          content={`${data.name} shares their experience interviewing for ${data.role} at ${data.company}.`}
        />
        <meta property="og:image" content={data.profile_pic} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://pict.life/exp/${id}`} />
      </Head>
      <div style={styles.container}>
        <div style={styles.header}>
          <img src={data.profile_pic} alt="Profile" style={styles.profilePic} />
          <div style={styles.headerText}>
            <h1 style={styles.name}>{data.name}</h1>
            <p style={styles.meta}>
              {data.company} - {data.role} | {data.branch} | {data.batch}
            </p>
            <p style={styles.date}>{data.date}</p>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.markdownContent}>
            <MarkdownRenderer content={data.exp_text} />
          </div>
        </div>
        <div style={styles.footer}>
          <p style={styles.views}>Views: {data.views}</p>
        </div>
        {/* Display links to other articles */}
        <div style={styles.relatedArticles}>
          <h3>Related Experiences:</h3>
          <ul style={styles.relatedArticlesList}>
            {articles.map((article) => (
              <li key={article._id}>
                <a href={`http://localhost:3000/single/${article.uid}`} style={styles.link}>
                  {article.uid}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#ffffff",
    color: "#333333",
    margin: "0 auto",
    maxWidth: "800px",
    padding: "40px 20px",
    lineHeight: "1.6",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#666666",
    marginTop: "40px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "40px",
  },
  profilePic: {
    borderRadius: "50%",
    width: "100px",
    height: "100px",
    marginRight: "24px",
    border: "2px solid #e0e0e0",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: "28px",
    fontWeight: "600",
    margin: "0 0 8px 0",
    color: "#222222",
  },
  meta: {
    fontSize: "16px",
    color: "#666666",
    margin: "0 0 8px 0",
  },
  date: {
    fontSize: "14px",
    color: "#888888",
    margin: "0",
  },
  content: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#222222",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #e0e0e0",
  },
  markdownContent: {
    fontSize: "16px",
    color: "#444444",
  },
  footer: {
    textAlign: "center",
    fontSize: "14px",
    color: "#888888",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  },
  views: {
    margin: "0",
  },
  relatedArticles: {
    marginTop: "40px",
  },
  relatedArticlesList: {
    listStyleType: "none",
    paddingLeft: "0",
  },
  link: {
    color: "#0070f3",
    textDecoration: "none",
    fontSize: "16px",
  },
};
