/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://theinterviewroom.in",
  generateRobotsTxt: true,
  exclude: [
    "/login",
    "/profile",
    "/post",
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
