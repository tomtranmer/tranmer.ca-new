import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages with their own noindex tag stay crawlable so Google can see it.
      disallow: ["/api/", "/review"],
    },
    sitemap: "https://tranmer.ca/sitemap.xml",
  };
}
