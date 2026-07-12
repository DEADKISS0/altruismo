import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export function createBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase not configured");
  }
  return createClient<Database>(supabaseUrl, supabaseKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient();
}
