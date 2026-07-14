import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Detect locale from pathname
  const pathname = new URL(request.url).pathname;
  const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || defaultLocale;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/${locale}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/${locale}${next}`);
      } else {
        return NextResponse.redirect(`${origin}/${locale}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
