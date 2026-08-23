import assert from "node:assert/strict";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";

async function request(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  assert.notEqual(body.trim(), "", `${path} returned an empty body`);
  assert.equal(
    body.includes("ERR_SSL_") || body.includes("MongoServerSelectionError"),
    false,
    `${path} leaked an infrastructure error`
  );

  return { response, contentType, body };
}

async function jsonRequest(path) {
  const result = await request(path);
  assert.match(result.contentType, /application\/json/);
  let data;
  assert.doesNotThrow(() => {
    data = JSON.parse(result.body);
  }, `${path} returned invalid JSON`);
  return { ...result, data };
}

const feed = await jsonRequest("/api/feed?page=0&itemsPerPage=2&sort=latest");
assert.equal(feed.response.status, 200);
assert.ok(Array.isArray(feed.data));
assert.ok(feed.data.length > 0);
assert.equal("exp_text" in feed.data[0], false);
assert.equal(typeof feed.data[0].preview, "string");
assert.equal(
  /(^|\s)(#{1,6}\s|!\[|---|```)(\s|$)/.test(feed.data[0].preview),
  false,
  "feed preview leaked Markdown/MDX syntax"
);
assert.ok(feed.body.length < 100_000, `feed payload is ${feed.body.length} bytes`);

for (const path of [
  "/api/feed?sort=trending&itemsPerPage=2&contentType=interview",
  "/api/feed?sort=trending&itemsPerPage=2&contentType=tale",
  "/api/feed?sort=random&itemsPerPage=2",
  "/api/feed?options=authors",
  "/api/colleges?page=1&limit=2",
  "/api/getCompanies",
  "/api/postsCount",
]) {
  const result = await jsonRequest(path);
  assert.equal(result.response.status, 200, `${path} failed`);
}

const companies = await jsonRequest("/api/getCompanies");
assert.ok(Array.isArray(companies.data.data));
assert.ok(companies.body.length < 100_000, `companies payload is ${companies.body.length} bytes`);
for (const company of companies.data.data) {
  assert.deepEqual(Object.keys(company).sort(), ["name", "slug"]);
}

const sitemap = await request("/sitemap.xml");
assert.equal(sitemap.response.status, 200);
assert.match(sitemap.contentType, /xml|text/);
assert.match(sitemap.body, /<(urlset|sitemapindex)/);

// Pick a real slug from the API rather than hard-coding one: this asserted
// "/companies/arista" while the seeded slug is "arista-networks", so the smoke
// test had been failing on a 404 regardless of the app's health.
const [sampleCompany] = companies.data.data;
assert.ok(sampleCompany?.slug, "expected at least one company from /api/getCompanies");
const companyPage = await request(`/companies/${sampleCompany.slug}`);
assert.equal(companyPage.response.status, 200);
assert.match(companyPage.body, new RegExp(sampleCompany.name.slice(0, 6).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));

// --- privacy: no endpoint may hand out the array of liker emails ---
const topStories = await jsonRequest("/api/topStories?itemsPerPage=3");
assert.ok(Array.isArray(topStories.data));
for (const post of topStories.data) {
  assert.equal(Array.isArray(post.likes), false, "/api/topStories returned the raw likes array of liker emails");
  assert.equal("email" in post, false, "/api/topStories leaked the author email");
  assert.equal("author" in post, false, "/api/topStories leaked the joined user document");
}

const [firstPost] = topStories.data;
if (firstPost?.uid) {
  const single = await jsonRequest(`/api/exp?uid=${encodeURIComponent(firstPost.uid)}`);
  assert.equal(Array.isArray(single.data.likes), false, "/api/exp returned the raw likes array");
  assert.equal("author" in single.data, false, "/api/exp leaked the joined user document");
}

const home = await request("/");
assert.equal(
  /"likes":\s*\[\s*"/.test(home.body),
  false,
  "the landing page RSC payload still carries an array of liker emails"
);

// --- NoSQL operator injection: {"id": {"$gt": ""}} must not be treated as an id ---
for (const path of ["/api/like", "/api/view"]) {
  const injected = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: { $gt: "" } }),
  });
  // 400 (rejected) or 401 (auth first) -- never 200, which would mean it ran.
  assert.notEqual(injected.status, 200, `${path} accepted an operator object as an id`);
}

console.log("data smoke: passed");
