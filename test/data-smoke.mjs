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

const companyPage = await request("/companies/arista");
assert.equal(companyPage.response.status, 200);
assert.match(companyPage.body, /Arista/i);

console.log("data smoke: passed");
