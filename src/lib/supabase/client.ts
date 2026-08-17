import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xfaogcywpxnmitkcltut.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW9nY3l3cHhubWl0a2NsdHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODI2MDUsImV4cCI6MjEwMDY1ODYwNX0.2VqxnlK_MJ3q6SmQ9AZdH5-MDyic_9SVQjhD8n0eFNc";

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
