export function isSupabaseServiceConfigured(): boolean {
  const url = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL : "";
  const key = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY : "";
  return Boolean(url && key);
}
