import { createClient } from "@/lib/supabase/server";
import { PageViewerClient } from "@/components/page-viewer-client";
import { PageParams } from "@/types";

export default async function PageDetailPage({ params }: PageParams) {
  const { id } = await params;
  let initialPage = null;
  let initialChallenges: any[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pages")
      .select("*, author:profiles(*), categories(slug)")
      .eq("id", id)
      .limit(1);

    const rows = (data || []) as any[];
    if (rows.length > 0) {
      const p = rows[0];
      initialPage = {
        id: p.id,
        author_id: p.author_id,
        author: p.author ? {
          id: p.author.id,
          email: p.author.email || "",
          name: p.author.name,
          avatar_url: p.author.avatar_url,
          bio: p.author.bio,
          role: p.author.role,
          points: p.author.points,
          level: p.author.level,
          created_at: p.author.created_at,
        } : undefined,
        title: p.title,
        description: p.description || null,
        category: p.categories?.slug || null,
        file_url: p.file_url || "",
        is_open_source: p.is_open_source || false,
        source_code: p.source_code || null,
        views: p.views || 0,
        average_rating: Number(p.average_rating) || 0,
        created_at: p.created_at,
        comments_count: p.comments_count || 0,
        tags: [],
      };

      // Fetch challenges for this tool
      const { data: challenges } = await supabase
        .from("challenges")
        .select("*")
        .eq("page_id", id)
        .limit(5);

      initialChallenges = (challenges || []).map((c: any) => ({
        id: c.id,
        page_id: c.page_id,
        title: c.title,
        description: c.description,
        duration_days: c.duration_days,
        goal_type: c.goal_type,
        goal_value: c.goal_value,
        reward_text: c.reward_text,
        is_active: c.is_active,
      }));
    }
  } catch (e) {
    console.error("Error fetching page:", e);
  }

  return <PageViewerClient id={id} initialPage={initialPage} initialChallenges={initialChallenges} />;
}
