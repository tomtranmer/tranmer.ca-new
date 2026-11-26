import type { MetadataRoute } from "next";

const BASE = "https://tranmer.ca";

// Public pages with real content. Placeholder, client-only and form pages are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/web`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/referral`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE}/blog`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
