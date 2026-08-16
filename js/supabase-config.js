/**
 * Supabase Client Configuration
 * 
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project credentials.
 * You can find these in your Supabase Dashboard -> Project Settings -> API.
 * 
 * IMPORTANT:
 * - Only the public 'anon' publishable key is allowed in frontend code.
 * - NEVER use or expose the secret 'service_role' key.
 */

const SUPABASE_URL = 'https://xfaogcywpxnmitkcltut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW9nY3l3cHhubWl0a2NsdHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODI2MDUsImV4cCI6MjEwMDY1ODYwNX0.2VqxnlK_MJ3q6SmQ9AZdH5-MDyic_9SVQjhD8n0eFNc';

// Initialize Supabase Client from the global library loaded via CDN
const supabaseClient = (typeof supabase !== 'undefined' && supabase.createClient)
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Expose client globally for auth and data queries
window.supabaseClient = supabaseClient;
