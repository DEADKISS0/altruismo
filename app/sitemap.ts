import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://altruismo-web.vercel.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/es/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/en/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/es/challenges`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/en/challenges`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/es/leaderboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/en/leaderboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/es/sponsors`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/en/sponsors`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic tool pages
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: pages } = await supabase
      .from("pages")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);

    const toolPages: MetadataRoute.Sitemap = (pages || []).map((page) => ({
      url: `${baseUrl}/es/page/${page.id}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...toolPages];
  } catch {
    return staticPages;
  }
}
