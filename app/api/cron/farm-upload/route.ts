import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type Supabase = ReturnType<typeof createServiceRoleClient>;

const PAGES_BUCKET = "pages";
const CATEGORY_ROTATION = [
  "productivity",
  "data",
  "productivity",
  "professional",
  "data",
  "productivity",
];

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

async function getCategoryId(supabase: Supabase, slug: string): Promise<string | null> {
  const { data } = await supabase.from("categories").select("id").eq("slug", slug).single();
  return ((data as unknown) as { id: string } | null)?.id || null;
}

async function uploadTool(
  supabase: Supabase,
  botUserId: string,
  html: string,
  title: string,
  description: string
) {
  const timestamp = Date.now();
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
  const path = `${botUserId}/${timestamp}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PAGES_BUCKET)
    .upload(path, html, { contentType: "text/html" });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(PAGES_BUCKET).getPublicUrl(path);
  const publicUrl = data.publicUrl;

  const categorySlug = CATEGORY_ROTATION[Math.floor(timestamp / 1000) % CATEGORY_ROTATION.length];
  const categoryId = await getCategoryId(supabase, categorySlug);

  const { data: page, error: insertError } = await supabase
    .from("pages")
    .insert({
      author_id: botUserId,
      category_id: categoryId,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description,
      file_url: publicUrl,
      is_open_source: true,
      source_code: html,
    } as never)
    .select("id")
    .single();

  if (insertError) throw insertError;

  return { id: (page as unknown as { id: string }).id, title, publicUrl };
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    status: "ready",
    message:
      "Endpoint listo. Usa POST con {html, title, description} para subir una herramienta, o configura generación automática con LLM.",
    triggeredAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botUserId = process.env.BOT_USER_ID;
  if (!botUserId) {
    return NextResponse.json({ error: "BOT_USER_ID not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { html, title, description } = body;

    if (!html || !title) {
      return NextResponse.json({ error: "Missing html or title" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const result = await uploadTool(
      supabase,
      botUserId,
      html,
      title,
      description || `Herramienta generada por Chat RR aliados — ${new Date().toLocaleString("es-ES")}`
    );

    return NextResponse.json({
      ok: true,
      pageId: result.id,
      title: result.title,
      url: result.publicUrl,
      triggeredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[farm-upload] error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Farm upload failed",
        triggeredAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
