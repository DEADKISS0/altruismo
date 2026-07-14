import { createClient } from "@/lib/supabase/server";
import { PageViewerClient } from "@/components/page-viewer-client";
import { PageParams } from "@/types";

export default async function PageDetailPage({ params }: PageParams) {
  const { id } = await params;
  let initialPage = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pages")
      .select("id, author_id, title, description, file_url, source_code, is_open_source, views, average_rating, created_at, comments_count")
      .eq("id", id)
      .limit(1);

    const rows = (data || []) as any[];
    if (rows.length > 0) {
      const p = rows[0];
      initialPage = {
        id: p.id,
        author_id: p.author_id,
        title: p.title,
        description: p.description || null,
        category: null,
        file_url: p.file_url || "",
        is_open_source: p.is_open_source || false,
        source_code: p.source_code || null,
        views: p.views || 0,
        average_rating: Number(p.average_rating) || 0,
        created_at: p.created_at,
        comments_count: p.comments_count || 0,
        tags: [],
      };
    }
  } catch (e) {
    console.error("Error fetching page:", e);
  }

  return <PageViewerClient id={id} initialPage={initialPage} />;
}
