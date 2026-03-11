export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://edmontonweekend.ca/sitemap.xml",
  };
}
