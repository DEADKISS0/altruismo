import { isSupabaseConfigured } from "@/lib/supabase/client";

export function isSupabaseServiceConfigured(): boolean {
  return isSupabaseConfigured();
}
