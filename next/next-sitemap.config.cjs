/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://baseball-now.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/login", "/api/*"],
  transform: async (config, path) => ({
    loc: path,
    changefreq: getChangeFreq(path),
    priority: getPriority(path),
    lastmod: new Date().toISOString(),
  }),
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/api/"],
      },
    ],
    additionalSitemaps: [],
  },
};

function getChangeFreq(path) {
  if (path === "/" || path === "/topps-now" || path === "/games") return "daily";
  if (path === "/stats" || path === "/blog") return "weekly";
  return "monthly";
}

function getPriority(path) {
  if (path === "/") return 1.0;
  if (path === "/topps-now") return 0.9;
  if (["/stats", "/games", "/teams", "/blog"].includes(path)) return 0.8;
  return 0.7;
}
