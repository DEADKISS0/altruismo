import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("pages")
      .select("id, title, file_url, source_code")
      .eq("id", id)
      .limit(1);

    const page = rows?.[0] || null;
    return NextResponse.json({
      id,
      found: !!page,
      hasFileUrl: !!page?.file_url,
      fileUrl: page?.file_url || null,
      hasSourceCode: !!page?.source_code,
      sourceCodeLength: page?.source_code?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
