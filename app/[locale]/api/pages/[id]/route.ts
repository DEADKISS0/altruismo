import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createServiceRoleClient();

    const { data: page, error: fetchError } = await supabase
      .from("pages")
      .select("file_url, author_id")
      .eq("id", id)
      .single();

    if (fetchError || !page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const pageRow = page as Database["public"]["Tables"]["pages"]["Row"];
    if (pageRow.file_url) {
      const urlParts = pageRow.file_url.split("/");
      const bucketIndex = urlParts.findIndex((p) => p === "pages");
      if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
        const storagePath = urlParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from("pages").remove([storagePath]);
      }
    }

    const { error: deleteError } = await supabase.from("pages").delete().eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}