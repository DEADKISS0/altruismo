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
      .select("id, title, file_url, source_code")
      .eq("id", id)
      .single();

    return NextResponse.json({ data, hasFileUrl: !!data?.file_url, hasSourceCode: !!data?.source_code });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
