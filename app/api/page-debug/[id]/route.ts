import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pages")
      .select("id, author_id, title, description, file_url, source_code, is_open_source, views, average_rating, created_at, category_id")
      .eq("id", id)
      .limit(1);

    const rows = (data || []) as any[];
    const page = rows.length > 0 ? rows[0] : null;

    return NextResponse.json({
      found: !!page,
      page: page ? {
        id: page.id,
        author_id: page.author_id,
        title: page.title,
        description: page.description,
        file_url: page.file_url,
        source_code: page.source_code,
        is_open_source: page.is_open_source,
        views: page.views,
        average_rating: page.average_rating,
        created_at: page.created_at,
        category_id: page.category_id,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error), found: false }, { status: 200 });
  }
}
