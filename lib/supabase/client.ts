"use client";

import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export const createClient = () => {
  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return client;
};
