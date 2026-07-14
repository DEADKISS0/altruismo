import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: page } = await supabase
      .from("pages")
      .select("id, author_id, file_url")
      .eq("id", id)
      .single<{ id: string; author_id: string; file_url: string } | null>();

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (page.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      if (page.file_url.includes("supabase.co")) {
        const url = new URL(page.file_url);
        const pathMatch = url.pathname.match(/\/object\/public\/pages\/(.*)/);
        if (pathMatch) {
          await supabase.storage.from("pages").remove([pathMatch[1]]);
        }
      }
    } catch {
      // Ignore storage errors
    }

    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
