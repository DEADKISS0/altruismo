import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pages")
      .select("id, title")
      .limit(3);

    return NextResponse.json({
      connected: !!data,
      pagesCount: data?.length || 0,
      error: error?.message || null,
      envUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      envKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  } catch (e) {
    return NextResponse.json({
      error: String(e),
      envUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      envKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
}
