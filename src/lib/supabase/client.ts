import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton browser client instance
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
