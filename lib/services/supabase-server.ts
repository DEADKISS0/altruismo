import { createClient } from "@/lib/supabase/server";
import { createService } from "./supabase-service";

export * from "./supabase-service";

export async function getSupabaseService() {
  const client = await createClient();
  return createService(client);
}
